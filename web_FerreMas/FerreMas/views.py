from django.shortcuts import render


def inicio(request):
    return render(request, 'web/inicio.html')

def acceso(request):
    return render(request, 'registration/acceso.html')

def productos(request):
    return render(request, 'web/productos.html')


def carrito(request):
    return render(request, 'web/carrito.html')
