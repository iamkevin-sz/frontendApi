<template>
    <div>
        <Dialog header="Editar Producto" v-model:visible="showDialog" :modal="true" :closable="true"
            @hide="closeDialog">
            <form @submit.prevent="updateProducto">
                <div class="p-grid p-fluid p-formgrid">
                    <div class="p-field p-col-12">
                        <label for="name">Nombre del Producto</label>
                        <InputText id="name" v-model="editedProducto.name"
                            :class="{ 'p-invalid': v$.editedProducto.name.$error }" />
                        <small v-if="v$.editedProducto.name.$error" class="p-error">
                            El nombre es obligatorio
                        </small>
                    </div>
                    <div class="p-field p-col-12">
                        <label for="sucursales">Sucursales</label>
                        <MultiSelect id="sucursales" v-model="selectedSucursales" :options="sucursales"
                            optionLabel="name" placeholder="Selecciona sucursales" @change="handleSucursalChange" />
                    </div>
                    <div class="p-field p-col-12">
                        <label for="globalPrice">Precio Global</label>
                        <div class="p-inputgroup">
                            <InputNumber id="globalPrice" v-model="globalPrice" mode="currency" currency="BOB"
                                locale="es-BO" :min="0" />
                            <Button label="Establecer Precio" @click="applyGlobalPrice(globalPrice)"
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
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="sucursal in selectedSucursales" :key="sucursal.id">
                                        <td>{{ sucursal.name }}</td>
                                        <td>
                                            <InputNumber :id="'price_' + sucursal.id"
                                                v-model="sucursalPrices[sucursal.id]" mode="currency" currency="BOB"
                                                locale="es-BO" :class="{ 'p-invalid': !sucursalPrices[sucursal.id] }"
                                                :min="0" />
                                            <small v-if="!sucursalPrices[sucursal.id]" class="p-error">
                                                El monto es obligatorio
                                            </small>
                                        </td>
                                        <td>
                                            <Button icon="pi pi-trash" class="p-button-danger p-button-sm"
                                                @click="removeSucursal(sucursal.id)" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="p-col-12 p-mt-3">
                        <Button label="Guardar Cambios" severity="success" type="submit" />
                    </div>
                </div>
            </form>
        </Dialog>
    </div>
</template>

<script>
import { ref, reactive, watch, onMounted, toRefs } from 'vue'
import axios from 'axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import InputNumber from 'primevue/inputnumber'
import { useToast } from 'primevue/usetoast'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { fetchSucursales, initializeSelectedSucursales, handleSucursalChange, applyGlobalPrice, removeSucursal,updateProducto,validatePrices } from './utils'

export default {
    name: 'EditarProducto',
    components: {
        Button,
        Dialog,
        InputText,
        MultiSelect,
        InputNumber
    },
    props: {
        productToEdit: {
            type: Object,
            required: true
        }
    },
    emits: ['productUpdated', 'closeDialog'],
    setup(props, { emit }) {
        const showDialog = ref(true)
        const editedProducto = ref({ ...props.productToEdit })
        const sucursales = ref([])
        const selectedSucursales = ref([])
        const sucursalPrices = reactive({})
        const globalPrice = ref(null)
        const sucursalesToDelete = ref([])
        const toast = useToast()

        const rules = {
            editedProducto: {
                name: { required }
            }
        }

        const v$ = useVuelidate(rules, { editedProducto })

        

        const closeDialog = () => {
            showDialog.value = false
            emit('closeDialog')
        }

        onMounted(async () => {
            // Espera a que las sucursales se carguen
            await fetchSucursales(sucursales, toast);

            // Inicializa selectedSucursales después de que sucursales esté cargado
            initializeSelectedSucursales(props.productToEdit, sucursales, selectedSucursales, sucursalPrices);
        });

        // Watchers para globalPrice y selectedSucursales para aplicar el precio global
        watch(globalPrice, (newVal) => {
            applyGlobalPrice(newVal, selectedSucursales, sucursalPrices)
        })

        watch(() => props.productToEdit, (newProduct) => {
            console.log("prop.productToEdit",prop.productToEdit)
            editedProducto.value = { ...newProduct }
            initializeSelectedSucursales(props.productToEdit, sucursales, selectedSucursales, sucursalPrices);
        })
        // todo lo que devuelve en return esta disponible en la plantilla
        return {
            showDialog,
            editedProducto,
            sucursales,
            selectedSucursales,
            sucursalPrices,
            globalPrice,
            sucursalesToDelete,
            updateProducto: () => updateProducto({ $v: v$, editedProducto, selectedSucursales, sucursalPrices, showDialog, toast, emit,props }),
            handleSucursalChange: () => handleSucursalChange(selectedSucursales, sucursalPrices),
            applyGlobalPrice: () => applyGlobalPrice(globalPrice.value, selectedSucursales, sucursalPrices),
            v$,
            closeDialog,
            removeSucursal:(id) => removeSucursal(id, selectedSucursales, sucursalesToDelete, sucursalPrices),
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

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #ccc;
    padding: 0.5rem 1rem;
}
</style>
