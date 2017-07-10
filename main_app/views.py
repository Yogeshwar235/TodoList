# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.core.exceptions import PermissionDenied
from django.http import Http404
from django.shortcuts import render, redirect

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from main_app.models import TodoList, TodoItem
from main_app.serializers import TodoListSerializer, TodoItemSerializer, UserSerializer
from django.contrib.auth.models import User


def home(request):
    if permissions.is_authenticated(request.user):
        return render(request, "index.html", context={"user": request.user})
    return redirect('rest_framework:login')


# @method_decorator(csrf_exempt, name='dispatch')
class TodoListList(APIView):
    """
    List all snippets, or create a new snippet.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, format=None):
        todo_lists = TodoList.objects.filter(owner=request.user)
        serializer = TodoListSerializer(todo_lists, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = TodoListSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @method_decorator(csrf_exempt, name='dispatch')
class TodoListDetail(APIView):
    """
    Retrieve, update or delete a TodoList instance.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self, pk):
        try:
            todo_list = TodoList.objects.get(pk=pk)
            if todo_list.owner is not self.request.user:
                raise PermissionDenied()
            return todo_list
        except TodoList.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        todo_list = self.get_object(pk)
        serializer = TodoListSerializer(todo_list)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        todo_list = self.get_object(pk)
        serializer = TodoListSerializer(todo_list, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        todo_list = self.get_object(pk)
        todo_list.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# @method_decorator(csrf_exempt, name='dispatch')
class TodoItemList(APIView):
    """
    List all snippets, or create a new snippet.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get_todolist_object(self, list_pk):
        try:
            todo_list = TodoList.objects.get(pk=list_pk)
            if todo_list.owner is not self.request.user:
                raise PermissionDenied()
            return todo_list
        except TodoItem.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        todo_list = self.get_todolist_object(list_pk=pk)
        todo_items = TodoItem.objects.filter(todo_list=todo_list)
        serializer = TodoItemSerializer(todo_items, many=True)
        return Response(serializer.data)

    def post(self, request, pk, format=None):
        todo_list = self.get_todolist_object(list_pk=pk)
        serializer = TodoItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(todo_list=todo_list)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @method_decorator(csrf_exempt, name='dispatch')
class TodoItemDetail(APIView):
    """
    Retrieve, update or delete a TodoList instance.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self, list_pk, item_pk):
        try:
            todo_list = TodoList.objects.get(pk=list_pk)
            return TodoItem.objects.filter(todo_list=todo_list).get(pk=item_pk)
        except TodoItem.DoesNotExist:
            raise Http404

    def get(self, request, list_pk, item_pk, format=None):
        todo_item = self.get_object(list_pk, item_pk)
        serializer = TodoItemSerializer(todo_item)
        return Response(serializer.data)

    def put(self, request, list_pk, item_pk, format=None):
        todo_item = self.get_object(list_pk, item_pk)
        serializer = TodoItemSerializer(todo_item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, list_pk, item_pk, format=None):
        todo_item = self.get_object(list_pk, item_pk)
        todo_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserList(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetail(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = User.objects.all()
    serializer_class = UserSerializer
