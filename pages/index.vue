<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

// Interfaces y referencias reactivas
import type { Login } from "@/interfaces/Login.Interface";
const apiURL = useCookie("apiURL");
const userLogin = useCookie<Login>("user"); // Donde guardaremos el token
const email = ref("");
const password = ref("");
const loadingLogin = ref(false);
const msgAlert = ref("");

// Reglas de validación (ajusta según tu composable)
const { ruleEmail, rulePassLen, ruleRequired } = useFormRules();

// Navegar a /inicio después de registrarse
const SingUp = () => {
  navigateTo("/inicio");
};

// Acción de login
const onClickLogin = async () => {
  loadingLogin.value = true;
  msgAlert.value = "";

  // Validación mínima
  if (!email.value || !password.value) {
    msgAlert.value = "Llene los datos correctamente";
    loadingLogin.value = false;
    return;
  }

  // Llamada al endpoint de login (ajusta la ruta si es distinta)
  const { data: resLogin, error } = await useFetch<Login>(`${apiURL.value}/auth/login`, {
    method: "POST",
    body: {
      email: email.value,
      password: password.value,
    },
  });

  // Si hubo error a nivel de fetch/servidor
  if (error.value) {
    msgAlert.value = error.value.data?.error || "Error al iniciar sesión";
    loadingLogin.value = false;
    return;
  }

  // Si no llega respuesta (caso raro)
  if (!resLogin.value) {
    msgAlert.value = "No se recibió respuesta del servidor";
    loadingLogin.value = false;
    return;
  }

  // Verifica si el backend retorna un token o un error
  if (!resLogin.value.token) {
    msgAlert.value = "Credenciales inválidas (no se encontró token en la respuesta)";
    loadingLogin.value = false;
    return;
  }

  // Guardar token (o datos) en la cookie userLogin
  userLogin.value = {
    token: resLogin.value.token,
    // si tu backend retorna más datos, agrégalos aquí
    // rol: resLogin.value.rol,
    // ...
  };

  loadingLogin.value = false;
  // Redirige al dashboard (o donde quieras)
  navigateTo("/inicio");
};

// (Opcional) Decodificar token (o refrescarlo)
const decodeToken = ref("");
const decodeTokenBtn = async () => {
  const { data: tokenDec, error } = await useFetch<Login>(`${apiURL.value}/auth/refresh-token`, {
    method: "POST",
    body: {
      token: userLogin.value.token,
    },
  });

  if (error.value) {
    msgAlert.value = error.value.data?.error || "Error al refrescar token";
    return;
  }

  decodeToken.value = tokenDec.value;
};
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row no-gutters class="fill-height d-flex align-center justify-center">
      <!-- Columna principal (formulario) -->
      <v-col cols="12" md="6" lg="5" sm="6">
        <v-row no-gutters class="d-flex align-center justify-center">
          <v-col cols="12" md="6">
            <h1>Iniciar sesión</h1>
            <p class="text-medium-emphasis">Ingresa tus datos</p>

            <div class="mt-1">
              <label class="label text-grey-darken-2" for="email">Email</label>
              <VTextField
                :rules="[ruleRequired, ruleEmail]"
                v-model="email"
                prepend-inner-icon="fluent:mail-24-regular"
                id="email"
                name="email"
                type="email"
                @keydown.enter="onClickLogin"
              />
            </div>

            <div class="mt-1">
              <label class="label text-grey-darken-2" for="password">Contraseña</label>
              <VTextField
                :rules="[ruleRequired, rulePassLen]"
                v-model="password"
                prepend-inner-icon="fluent:password-20-regular"
                id="password"
                name="password"
                type="password"
                @keydown.enter="onClickLogin"
              />
            </div>

            <div class="my-2">
              <v-alert v-if="msgAlert" color="error">{{ msgAlert }}</v-alert>
            </div>

            <div class="mt-5">
              <v-btn
                @click="onClickLogin"
                :loading="loadingLogin"
                block
                min-height="44"
                class="gradient primary"
              >
                Ingresar
              </v-btn>
            </div>

            <!-- Botón opcional para refrescar/decodificar token
            <v-btn block min-height="44" @click="decodeTokenBtn()" class="gradient primary">
              decodetoken
            </v-btn>
            <p> {{ decodeToken }} </p>
            -->
          </v-col>
        </v-row>
      </v-col>

      <!-- Columna imagen -->
      <v-col class="hidden-md-and-down fill-height d-flex align-center justify-center" md="6" lg="7">
        <v-img src="public/fondo/fondo1.png" max-width="75%">
          <div class="text-center w-50 text-white mx-auto align-center">
            <!-- Mensajes/elementos sobre la imagen -->
          </div>
        </v-img>
      </v-col>
    </v-row>
  </v-container>
</template>