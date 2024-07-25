<template>
  <div>
    <Dialog header="Editar Sucursal" v-model:visible="showDialog" :modal="true" :closable="true" @hide="closeDialog">
      <form @submit.prevent="editSucursal">
        <div class="p-field">
          <label for="name"> Nombre de la Sucursal </label>
          <InputText id="name" v-model="sucursal.name" required />
        </div>
        <div class="p-field">
          <label for="location"> Localización </label>
          <InputText id="location" v-model="sucursal.location" required />
        </div>
        <Button label="Guardar" severity="success" icon="pi pi-check" type="submit" />
      </form>
    </Dialog>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'

export default {
  name: 'EditarSucursales',
  props: {
    sucursalData: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const showDialog = ref(true)
    const sucursal = ref({ ...props.sucursalData })
    const toast = useToast()

    watch(props.sucursalData, (newVal) => {
      sucursal.value = { ...newVal }
      showDialog.value = true
    })

    const editSucursal = async () => {
      try {
        console.log("Datos que se envían a la API:", sucursal.value) // Log para verificar datos
        console.log(`URL de la solicitud: http://localhost:3000/branch-office/${sucursal.value.id}`)
        await axios.put(`http://localhost:3000/branch-office/${sucursal.value.id}`, sucursal.value)
        showDialog.value = false
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Sucursal actualizada', life: 3000 })
        emit('sucursalUpdated')
        emit('closeDialog')
      } catch (error) {
        console.error('Error updating sucursal:', error)
        console.error('Error details:', error.response)
        if (error.response.status === 422) {
          toast.add({ severity: 'error', summary: 'Error', detail: 'La sucursal ya Existe!', life: 3000 })
        } else {
          toast.add({ severity: 'error', summary: 'Error', detail: 'Error aleditar la sucursal', life: 3000 })
        }
      }
    }

    const closeDialog = () => {
      showDialog.value = false
      emit('closeDialog')
    }

    return {
      showDialog,
      sucursal,
      editSucursal,
      closeDialog
    }
  }
}
</script>

<style scoped>
.p-field {
  margin-bottom: 1rem;
}
</style>
