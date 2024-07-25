<template>
  <div id="app">
    <nav class="botones">
      <RouterLink to="/productos" class="nav-button">Ir a Productos 🛍️</RouterLink> <br>
      <RouterLink to="/sucursales" class="nav-button">Ir a Sucursales 🏠</RouterLink>
      <Button :icon="isDarkTheme ? 'pi pi-sun' : 'pi pi-moon'" @click="toggleTheme" />
    </nav>
    <main style="width: 60%;">
      <RouterView />
    </main>
  </div>
</template>

<script>

import { ref } from 'vue'
import Button from 'primevue/button'
import { usePrimeVue } from 'primevue/config'

export default {
  name: 'App',
  components: {
    Button
  },
  setup() {
    const PrimeVue = usePrimeVue()
    const isDarkTheme = ref(false)

    const toggleTheme = () => {
      const newTheme = isDarkTheme.value ? 'aura-light-green' : 'lara-dark-green'
      const oldTheme = isDarkTheme.value ? 'lara-dark-green' : 'aura-light-green'
      PrimeVue.changeTheme(oldTheme, newTheme, 'theme-link', () => {
        isDarkTheme.value = !isDarkTheme.value
      })
    }

    return {
      isDarkTheme,
      toggleTheme
    }
  }
}


</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

nav {
  margin-bottom: 20px;
}

.nav-button {
  background-color: #10b981;
  color: #ffffff;
  padding: 10px 20px;
  border: 1px solid #10b981;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
}

.nav-button:hover {
  background-color: #2c3e50;
}

.botones {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}
</style>
