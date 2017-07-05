from django.conf.urls import url
from main_app.views import TodoListDetail, TodoListList, TodoItemList, TodoItemDetail, home

urlpatterns = [
    url(r'^api/lists/$', TodoListList.as_view(), name="lists"),
    url(r'^api/lists/(?P<pk>[0-9]+)/$', TodoListDetail.as_view(),name="list"),
    url(r'^api/lists/(?P<pk>[0-9]+)/items/$', TodoItemList.as_view(), name="items"),
    url(r'^api/lists/(?P<list_pk>[0-9]+)/items/(?P<item_pk>[0-9]+)/$', TodoItemDetail.as_view(), name="item"),
    url(r'^$', home, name="home"),
    # url(r'^api/lists/(?P<pk>[0-9]+)/$'),
    # url(r'^api/lists/(?P<pk>[0-9]+)/items/$'),
    # url(r'^api/items/(?P<pk>[0-9]+)/$'),
]
