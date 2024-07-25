<template>
  <div>
    <Button label="Nueva Sucursal" icon="pi pi-plus" @click="showDialog = true" />
    <Dialog header="Nueva Sucursal" v-model:visible="showDialog" :modal="true" :closable="true">
      <form @submit.prevent="addSucursal">
        <div class="p-field">
          <label for="name"> Nombre de la Sucursal </label>
          <InputText id="name" v-model="newSucursal.name" :class="{ 'p-invalid': $v.newSucursal.name.$error }" />
          <small v-if="$v.newSucursal.name.$error" class="p-error">
            El nombre es obligatorio
          </small>
        </div>
        <div class="p-field">
          <label for="location"> Localización </label>
          <InputText id="location" v-model="newSucursal.location"
            :class="{ 'p-invalid': $v.newSucursal.location.$error }" />
          <small v-if="$v.newSucursal.location.$error" class="p-error">
            La localización es obligatoria
          </small>
        </div>
        <Button label="Guardar" severity="success" icon="pi pi-check" type="submit" />
      </form>
    </Dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
// import {isNameUnique} from '../../validators/uniqueNameValidator'

export default {
  name: 'NuevaSucursal',
  components: {
    Button,
    Dialog,
    InputText
  },
  setup(_, { emit }) {
    const showDialog = ref(false)
    const newSucursal = ref({
      name: '',
      location: ''
    })
    const toast = useToast()
    const rules = {
      newSucursal: {
        // name: { required, isNameUnique:isNameUnique('branch-office') },
        name: { required },
        location: { required }
      }
    }
    const $v = useVuelidate(rules, { newSucursal })

    const addSucursal = async () => {
      $v.value.$touch()
      if ($v.value.$invalid) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Por favor complete el formulario correctamente', life: 3000 }) // 3 segundos 
        return
      }

      try {
        await axios.post('http://localhost:3000/branch-office', newSucursal.value)
        newSucursal.value = { name: '', location: '' }
        showDialog.value = false
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Sucursal guardada', life: 3000 })
        emit('sucursalAdded')
        $v.value.$reset()
      } catch (error) {
        console.error('Error adding sucursal:', error)
        if (error.response.status === 422) {
          toast.add({ severity: 'error', summary: 'Error', detail: 'La sucursal ya Existe!', life: 3000 })
        } else {
          toast.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar la sucursal', life: 3000 })
        }
      }
    }

    return {
      showDialog,
      newSucursal,
      addSucursal,
      $v
    }
  }
}
</script>

<style scoped>
.p-field {
  margin-bottom: 1rem;
}

.p-invalid {
  border-color: red !important;
}

.p-error {
  color: red;
  display: block;
  margin-top: 0.25rem;
}
</style>
