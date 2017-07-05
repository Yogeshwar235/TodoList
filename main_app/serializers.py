from rest_framework.serializers import ModelSerializer

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

    class Meta:
        model = TodoList
        fields = ['id', 'name', 'description', 'creation_date', 'items']
