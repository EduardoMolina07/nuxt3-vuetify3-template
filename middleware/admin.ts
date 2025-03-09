// nuxt3-vuetify3-template/middleware/admin.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
    // Aquí asumimos que tienes un composable o store donde guardas el rol
    const user = useUser(); 
    // useUser() es un ejemplo de composable donde guardas el usuario logueado
    // Podrías obtenerlo de un pinia store, vuex, o "useState" etc.
  
    // Si no está logueado o su rol no es ADMIN, redirige
    if (!user.value || user.value.rol !== 'ADMIN') {
      return navigateTo('/not-authorized'); 
    }
  });  