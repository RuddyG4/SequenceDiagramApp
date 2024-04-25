<script setup>
import { ref } from "vue";

const props = defineProps({
  selectedCell: {
    type: Object,
    required: true,
  },
});

const activeTab = ref("first");
const cell = ref(props.selectedCell);
</script>

<template>
  <div
    class="mx-4 p-4 absolute w-1/4 max-w-96 bg-white z-10 top-1/4 -translate-y-1/2 right-4 rounded border border-slate-400"
  >
    <div class="flex justify-between">
      <h3>Side bar</h3>
      <button type="button">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="rounded bg-slate-100 mt-4">
      <FwbTabs v-model="activeTab" directive="show" class="p-5">
        <FwbTab name="first" title="Shapes tools">
          <div v-if="!selectedCell" class="text-slate-400 py-4 text-center">
            Seleccione un elemento
          </div>
          <div v-else class="p-4">
            <div>
              <label for="shapeLabel">Label</label>
              <input
                v-model="cellData.label"
                class="w-full border border-slate-400 rounded p-2 mt-2"
                type="text"
                name="shapeLabel"
                id="shapeLabel"
                autocomplete="off"
              />
            </div>
            <div class="mt-4 flex justify-end">
              <button
                @click="deleteSelectedCell"
                type="button"
                class="text-red-500 text-sm bg-red-200 px-4 py-2 border border-red-500 rounded"
              >
                <i class="fa-solid fa-trash mr-2 fa-sm"></i>
                Eliminar
              </button>
            </div>
          </div>
        </FwbTab>
        <FwbTab name="second" title="Chat"> Chat </FwbTab>
      </FwbTabs>
    </div>
  </div>
</template>
