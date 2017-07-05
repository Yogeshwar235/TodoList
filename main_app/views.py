# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import logging
from django.http import Http404
from django.shortcuts import render

# Create your views here.
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from main_app.models import TodoList, TodoItem
from main_app.serializers import TodoListSerializer, TodoItemSerializer

def home(request):
    return render(request, "index.html")


# @method_decorator(csrf_exempt, name='dispatch')
class TodoListList(APIView):
    """
    List all snippets, or create a new snippet.
    """
    def get(self, request, format=None):
        todo_lists = TodoList.objects.all()
        serializer = TodoListSerializer(todo_lists, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        logging.debug(request.data)
        serializer = TodoListSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @method_decorator(csrf_exempt, name='dispatch')
class TodoListDetail(APIView):
    """
    Retrieve, update or delete a TodoList instance.
    """
    def get_object(self, pk):
        try:
            return TodoList.objects.get(pk=pk)
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
    def get(self, request, pk, format=None):
        todo_list = TodoList.objects.get(pk=pk)
        todo_items = TodoItem.objects.all().filter(todo_list=todo_list)
        serializer = TodoItemSerializer(todo_items, many=True)
        return Response(serializer.data)

    def post(self, request, pk, format=None):
        logging.debug(request.data)
        todo_list = TodoList.objects.get(pk=pk)
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
