<script setup lang="ts">
import type { Login } from '~/interfaces/Login.Interface';
import { useDisplay } from 'vuetify';

// Control del drawer (menú lateral)
const drawer = useCookie<boolean>('drawer');

// Cookie donde se guarda la información del usuario logueado
const userLogin = useCookie<Login | null>('user');

// OJO: Esto de abajo está “hardcodeado” solo para prueba.
//      En tu app real, querrás ELIMINAR esta asignación
//      y dejar que el login asigne correctamente la cookie.
userLogin.value = {
  status: true,
  msg: 'Hola',
  name: 'Eduardo',
  email: '2201010225@gmail.com',
  token: '123456789',
  tipoUsuario: ['ADMIN'] // Ejemplo de rol
};

// Para detectar si estás en mobile o no
const { mobile } = useDisplay();

// Función de logout
const logOut = async () => {
  // Borramos la cookie
  userLogin.value = null;
  // Navegamos a la página principal (o donde quieras)
  navigateTo('/');
};
</script>

<template>
  <v-app-bar>
    <!-- Botón para mostrar/ocultar el drawer lateral -->
    <v-btn variant="text" icon="mdi-menu" @click.stop="drawer = !drawer"></v-btn>

    <!-- Enlace (botón) solo visible si userLogin existe y es ADMIN -->
    <v-btn
      variant="text"
      v-if="userLogin && userLogin.tipoUsuario?.includes('ADMIN')"
      to="/users"
    >
      Gestión Usuarios
    </v-btn>

    <v-spacer></v-spacer>

    <!-- Menú con la info del usuario (avatar, logout, etc.) -->
    <v-menu rounded :close-on-content-click="false" v-if="userLogin">
      <template v-slot:activator="{ props }">
        <!-- Versión desktop: mostramos nombre y correo -->
        <v-list v-if="!mobile" class="hidden-sm-and-down" v-bind="props" style="cursor: pointer">
          <v-list-item :title="userLogin.name" :subtitle="userLogin.email" />
        </v-list>

        <!-- Versión mobile: sólo un avatar con inicial -->
        <v-btn v-if="mobile" icon v-bind="props">
          <v-avatar color="brown" size="default">
            <span class="text-h5">{{ userLogin.name.charAt(0) }}</span>
          </v-avatar>
        </v-btn>
      </template>

      <!-- Contenido del menú (tarjeta con info y botón logout) -->
      <v-card>
        <v-card-text>
          <div class="mx-auto text-center">
            <v-avatar color="brown">
              <span class="text-h5">{{ userLogin.name.charAt(0) }}</span>
            </v-avatar>
            <h3>{{ userLogin.name }}</h3>
            <p class="text-caption mt-1">
              {{ userLogin.email }}
            </p>

            <v-divider class="my-3" />

            <v-btn block rounded variant="elevated" color="error" @click="logOut()">
              Salir
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>