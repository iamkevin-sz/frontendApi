<template>
  <div>
    <Button label="Nuevo Producto" icon="pi pi-plus" @click="showDialog = true" class="p-mb-3" />
    <Dialog header="Nuevo Producto" v-model:visible="showDialog" :modal="true" :closable="true">
      <form @submit.prevent="addProducto">
        <div class="p-grid p-fluid p-formgrid">
          <div class="p-field p-col-12">
            <label for="name">Nombre del Producto</label>
            <InputText id="name" v-model="newProducto.name" :class="{ 'p-invalid': $v.newProducto.name.$error }"
              @input="validateProductName" />
            <small v-if="$v.newProducto.name.$pending" class="p-error">Validando...</small>
            <small v-if="$v.newProducto.name.$error && !$v.newProducto.name.$pending" class="p-error">
              El nombre ya existe o es obligatorio
            </small>
          </div>
          <div class="p-field p-col-12">
            <label for="sucursales">Sucursales</label>
            <MultiSelect id="sucursales" v-model="selectedSucursales" :options="sucursales" optionLabel="name"
              placeholder="Selecciona sucursales" @change="handleSucursalChange" />
          </div>
          <div class="p-field p-col-12">
            <label for="globalPrice">Precio Global</label>
            <div class="p-inputgroup">
              <InputNumber id="globalPrice" v-model="globalPrice" mode="currency" currency="BOB" locale="es-BO"
                :min="0" />
              <Button label="Establecer Precio"
                @click="applyGlobalPrice(globalPrice.value, selectedSucursales, sucursalPrices)"
                class="p-button-outlined p-ml-2" />
            </div>
          </div>
          <div class="p-col-12">
            <div v-if="selectedSucursales.length">
              <table>
                <thead>
                  <tr>
                    <th>Sucursal</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sucursal in selectedSucursales" :key="sucursal.id">
                    <td>{{ sucursal.name }}</td>
                    <td>
                      <InputNumber :id="'price_' + sucursal.id" v-model="sucursalPrices[sucursal.id]" mode="currency"
                        currency="BOB" locale="es-BO" :class="{ 'p-invalid': !sucursalPrices[sucursal.id] }" :min="0" />
                      <small v-if="!sucursalPrices[sucursal.id]" class="p-error">
                        El monto es obligatorio
                      </small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="p-col-12 p-mt-3">
            <Button label="Guardar" severity="success" type="submit" />
          </div>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script>
import { ref, reactive, watch, onMounted } from 'vue'
import axios from 'axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import InputNumber from 'primevue/inputnumber'
import { useToast } from 'primevue/usetoast'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { handleSucursalChange, fetchSucursales, applyGlobalPrice, validatePrices, addProducto } from './utils.js'
import { uniqueProductName } from './validator.js';

export default {
  name: 'NuevoProducto',
  components: {
    Button,
    Dialog,
    InputText,
    MultiSelect,
    InputNumber
  },
  setup(_, { emit }) {
    const showDialog = ref(false)
    const newProducto = ref({ name: '' })
    const sucursales = ref([])
    const selectedSucursales = ref([])
    const sucursalPrices = reactive({})
    const globalPrice = ref(null)
    const toast = useToast()
    const rules = {
      newProducto: {
        name: { required, unique: uniqueProductName }
      }
    };
    const $v = useVuelidate(rules, { newProducto });

    const validateProductName = async () => {
      await $v.value.newProducto.name.$validate();
      console.log("Validando nombre del producto...");
    };


    onMounted(async () => {
      // Espera a que las sucursales se carguen
      await fetchSucursales(sucursales, toast);
    });


    watch(globalPrice, (newVal) => {
      applyGlobalPrice(newVal, selectedSucursales, sucursalPrices)
    })


    return {
      showDialog,
      newProducto,
      sucursales,
      selectedSucursales,
      sucursalPrices,
      globalPrice,
      addProducto: () => addProducto({ $v, newProducto, selectedSucursales, sucursalPrices, globalPrice, showDialog, toast, emit }),
      handleSucursalChange: () => handleSucursalChange(selectedSucursales, sucursalPrices),
      applyGlobalPrice: (price) => applyGlobalPrice(price, selectedSucursales, sucursalPrices),
      validatePrices,
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

label {
  font-weight: 600;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f2f2f2;
}

.p-inputgroup .p-button-outlined {
  padding: 0.5rem 1rem;
}
</style>
