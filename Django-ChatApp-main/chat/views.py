from django.shortcuts import render, redirect
from django.db.models import Q
from django.contrib.auth.models import User
from .models import ChatRoom, Message


def get_chatrooms_with_last_message(user):
    # chat_rooms = ChatRoom.objects.all()
    # user = User.objects.get(username = user)
    query = Q(owner=user)
    query.add(Q(guest=user), Q.OR)
    chat_rooms = ChatRoom.objects.all().filter(query)
    chat_rooms_with_last_message = []

    for room in chat_rooms:
        last_message = (
            Message.objects.filter(chatroom=room).order_by("-timestamp").first()
        )
        room_name = room.owner.username if room.owner != user else room.guest.username

        chat_rooms_with_last_message.append(
            {
                "id": room.id,
                "room_name": room.name,
                "name_to_display": room_name,
                "last_message": {
                    "message": last_message.message if last_message else None,
                    "timestamp": last_message.timestamp if last_message else None,
                    "sender": last_message.sender.username
                    if last_message and last_message.sender
                    else None,
                },
            }
        )

    return chat_rooms_with_last_message


# Create your views here.
def index(request):
    user = request.user
    if not user.is_authenticated:
        return redirect("login")
    chat_rooms = get_chatrooms_with_last_message(user)

    return render(request, "index.html", context={"chat_rooms": chat_rooms})


def room(request, room_name):
    user = request.user
    if not user.is_authenticated:
        return redirect("login")
    chatroom, created = ChatRoom.objects.get_or_create(name=room_name)

    # chatroom = ChatRoom.objects.all().filter(name=room_name)
    chat_messages = Message.objects.filter(chatroom=chatroom)
    display_room_name = chatroom.owner.username if chatroom.owner != user else chatroom.guest.username

    context = {
        "room_name": room_name,
        "name_to_display": display_room_name,
        "chat_messages": chat_messages,
        "current_user": request.user.username,
    }
    owner = chatroom.owner
    guest = chatroom.guest
    if user == owner or user == guest:
        return render(request, "chat_room.html", context)

    return redirect("home")
