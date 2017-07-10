# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.


class TodoList(models.Model):
    """"""
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=128)
    creation_date = models.DateField()
    owner = models.ForeignKey('auth.User', related_name='todolists', on_delete=models.CASCADE)

    def __unicode__(self):
        return self.name


class TodoItem(models.Model):
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=128)
    completed = models.BooleanField()
    due_date = models.DateField()
    todo_list = models.ForeignKey(TodoList, related_name="items", on_delete=models.CASCADE)

    def __unicode__(self):
        return self.description
