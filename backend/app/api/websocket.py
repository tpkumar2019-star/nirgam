from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Set
import asyncio
import json
from app.simulation.engine import flood_engine

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.is_running = False
        self.current_time_min = 0
        self.time_step_min = 15
        self.playback_speed_sec = 2.5
        self.worker_task = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        # Send initial state immediately
        step_data = flood_engine.get_step_data(self.current_time_min)
        if step_data:
            await websocket.send_json({
                "type": "SIMULATION_UPDATE",
                "time_min": self.current_time_min,
                "data": step_data.model_dump()
            })

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        dead_conns = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_conns.append(connection)
        for dead in dead_conns:
            self.active_connections.discard(dead)

    async def start_simulation_loop(self):
        self.is_running = True
        while self.is_running:
            await asyncio.sleep(self.playback_speed_sec)
            self.current_time_min += self.time_step_min
            if self.current_time_min > 180:
                self.current_time_min = 0  # Loop back or stop

            step_data = flood_engine.get_step_data(self.current_time_min)
            if step_data:
                await self.broadcast({
                    "type": "SIMULATION_TICK",
                    "time_min": self.current_time_min,
                    "data": step_data.model_dump()
                })

    def stop_simulation_loop(self):
        self.is_running = False

manager = ConnectionManager()

async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            text = await websocket.receive_text()
            cmd = json.loads(text)
            action = cmd.get("action")

            if action == "START":
                if not manager.is_running:
                    asyncio.create_task(manager.start_simulation_loop())
                    await manager.broadcast({"type": "STATUS", "is_running": True})

            elif action == "PAUSE":
                manager.stop_simulation_loop()
                await manager.broadcast({"type": "STATUS", "is_running": False})

            elif action == "SET_TIME":
                target_min = int(cmd.get("time_min", 0))
                manager.current_time_min = target_min
                step_data = flood_engine.get_step_data(target_min)
                if step_data:
                    await manager.broadcast({
                        "type": "SIMULATION_UPDATE",
                        "time_min": target_min,
                        "data": step_data.model_dump()
                    })

            elif action == "RESET":
                manager.stop_simulation_loop()
                manager.current_time_min = 0
                step_data = flood_engine.get_step_data(0)
                if step_data:
                    await manager.broadcast({
                        "type": "SIMULATION_UPDATE",
                        "time_min": 0,
                        "data": step_data.model_dump()
                    })
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
