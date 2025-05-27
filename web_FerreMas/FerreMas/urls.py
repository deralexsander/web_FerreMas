from django.urls import path
from . import views

urlpatterns = [
    path('', views.inicio, name='inicio'),
    path('acceso/', views.acceso, name="acceso"),
    path('productos/', views.productos, name="productos"),
    path('carrito/', views.carrito, name="carrito"),
    path('perfil/', views.perfil, name="perfil"),
    path('registro_personal/', views.registro_personal, name="registro_personal"),
    path('bodega/', views.bodega, name="bodega"),
    path("api/subir-imagen/", views.subir_imagen, name="subir_imagen"),
    path('crear_producto/', views.crear_producto, name="crear_producto"),
    path('datos_personales/', views.datos_personales, name="datos_personales"),
    path('crear-preferencia/', views.crear_preferencia, name='crear_preferencia'),
    path('pedidos_realizados/', views.pedidos_realizados, name="pedidos_realizados"),
    path('trasferencias/', views.trasferencias, name="trasferencias"),
    path('historial_pedidos/', views.historial_pedidos, name="historial_pedidos"),
    path('armado_pedidos/', views.armado_pedidos, name="armado_pedidos"),
    path('crear_preferencia/', views.crear_preferencia, name='crear_preferencia'),
]