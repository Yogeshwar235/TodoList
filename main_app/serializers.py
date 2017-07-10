from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from django.contrib.auth.models import User
from main_app.models import TodoList, TodoItem


class TodoItemSerializer(ModelSerializer):
    class Meta:
        model = TodoItem
        fields = ['id', 'name', 'description', 'completed', 'due_date']


class TodoItemNameIdSerializer(ModelSerializer):
    class Meta:
        model = TodoItem
        fields = ['id', 'name']


class TodoListSerializer(ModelSerializer):
    items = TodoItemNameIdSerializer(many=True, read_only=True)
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = TodoList
        fields = ['id', 'name', 'description', 'creation_date', 'items', 'owner']


class UserSerializer(serializers.ModelSerializer):
    todolists = serializers.PrimaryKeyRelatedField(many=True, queryset=TodoList.objects.all())

    class Meta:
        model = User
        fields = ('id', 'username', 'todolists')
