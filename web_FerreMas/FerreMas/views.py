from django.shortcuts import render


def inicio(request):
    return render(request, 'web/inicio.html')

def acceso(request):
    return render(request, 'registration/acceso.html')

def productos(request):
    return render(request, 'web/productos.html')


def carrito(request):
    return render(request, 'web/carrito.html')

def perfil(request):
    return render(request, 'web/perfil.html')

def registro_personal(request):
    return render(request, 'registration/registro_personal.html')

def bodega(request):
    return render(request, 'web/bodega.html')
