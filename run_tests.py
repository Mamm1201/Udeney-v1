#!/usr/bin/env python
"""
Script para ejecutar tests con la configuración correcta
Uso: python run_tests.py [opciones]
"""
import os
import sys
import subprocess

def main():
    """Ejecutar tests con la configuración de testing"""
    # Configurar el módulo de settings para testing
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings.testing')
    
    # Construir el comando de test
    cmd = ['python', 'manage.py', 'test']
    
    # Agregar argumentos adicionales si se proporcionaron
    if len(sys.argv) > 1:
        cmd.extend(sys.argv[1:])
    else:
        # Por defecto, ejecutar todos los tests de udeneyv1
        cmd.append('udeneyv1.tests')
    
    # Agregar configuración de settings explícitamente
    cmd.extend(['--settings', 'ecommerce.settings.testing'])
    
    # Ejecutar el comando
    try:
        result = subprocess.run(cmd, check=True)
        return result.returncode
    except subprocess.CalledProcessError as e:
        return e.returncode

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)