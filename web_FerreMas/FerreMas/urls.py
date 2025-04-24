from django.urls import path
from . import views

urlpatterns = [
    path('', views.inicio, name='inicio'),
    path('acceso/', views.acceso, name="acceso"),
    path('productos/', views.productos, name="productos"),
    path('carrito/', views.carrito, name="carrito"),
]