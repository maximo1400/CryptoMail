import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth.models import User
from .models import Message, ChatRoom

import chat.symetric
import chat.ECDHE as edche


class ChatRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["content"]
        is_msg = text_data_json["is_message"]
        is_key = text_data_json["is_key"]
 
        # Extract the sender and chatroom information from the consumer's scope
        sender = self.scope["user"]
        room_name = self.scope["url_route"]["kwargs"]["room_name"]

        # Get the ChatRoom object
        chatroom = await sync_to_async(ChatRoom.objects.get)(name=room_name)

        if is_msg:
            # Save the message to the database
            mac = message["mac"]
            message = message["cipher"]
  
            await sync_to_async(Message.objects.create)(
                message=message, mac= mac, sender=sender, chatroom=chatroom
            )

            # Send the message
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chatroom_message",
                    "message": message,
                    'mac': mac,
                    "username": sender.username,
                },
            )
        elif is_key:
            # Send the shared key
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "shared_key",
                    "message": message,
                    "username": sender.username,
                },
            )


    async def chatroom_message(self, event):
        
        message = event["message"]
        username = event["username"]
        mac = event["mac"]

        #Send the content to client
        await self.send(
            text_data=json.dumps(
                {
                    "type": "chatroom_message",
                    "message": message,
                    "mac": mac,
                    "username": username,
                }
            )
        )
    
    async def shared_key(self, event):
        keyC = event["message"]["keyC"]
        keyM = event["message"]["keyM"]
        username = event["username"]
        #Send the content to client
        await self.send(
            text_data=json.dumps(
                {
                    "type": "shared_keys",
                    "keyC": keyC,
                    "keyM": keyM,
                    "username": username,
                }
            )
        )

