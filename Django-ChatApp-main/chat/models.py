from django.db import models
from django.contrib.auth.models import User


# # Create your models here.
# class User(models.Model):
#     name = models.CharField(max_length=100, unique=True)

#     def __str__(self):
#         return self.name


class ChatRoom(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(
        User, related_name="owner", on_delete=models.CASCADE, null=True
    )
    guest = models.ForeignKey(
        User, related_name="guest", on_delete=models.CASCADE, null=True
    )

    def __str__(self):
        return self.owner + " " + self.guest


class Message(models.Model):
    chatroom = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    signature = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message
