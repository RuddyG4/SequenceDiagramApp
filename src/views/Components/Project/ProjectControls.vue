<script setup>
import { ref } from "vue";
import {
  FwbButton,
  FwbModal,
  FwbSpinner,
  FwbInput,
  FwbDropdown,
  FwbListGroup,
  FwbListGroupItem,
} from "flowbite-vue";

defineEmits(["saveProject", "createRoomCode"]);

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  isCreatingRoomCode: {
    type: Boolean,
    default: false,
  },
});

const isShowModal = ref(false);

function closeModal() {
  isShowModal.value = false;
}

function showModal() {
  isShowModal.value = true;
}

const copyRoomCode = async () => {
  try {
    await navigator.clipboard.writeText(props.project.roomCode);
    console.log("Contenido copiado al portapapeles");
  } catch (err) {
    console.error("Error al copiar: ", err);
  }
};
</script>

<template>
  <div class="flex gap-x-4 m-4 absolute z-10">
    <div class="bg-white">
      <button type="button">
        <div class="rounded border border-slate-400 px-5 py-2.5">
          <i class="fa-solid fa-bars text-xl"></i>
        </div>
      </button>
    </div>
    <div class="bg-white">
      <ul class="flex gap-x-8 rounded border border-slate-400 px-4 py-2">
        <li>
          <input
            v-model="project.name"
            type="text"
            class="px-2 py-1 bg-slate-100 rounded border-slate-400 focus:outline-none focus:ring focus:ring-slate-300"
            id="proyect-name"
            placeholder="Proyect name"
            autocomplete="off"
          />
        </li>
        <li>
          <button
            @click="$emit('saveProject')"
            type="button"
            class="relative overflow-hidden rounded bg-neutral-950 px-4 py-1 text-white transition-all duration-300 hover:bg-neutral-800 hover:ring-2 hover:ring-neutral-800 hover:ring-offset-2"
          >
            <i class="fa-solid fa-save hidden lg:inline"></i>
            <span class="relative ml-2">Guardar</span>
          </button>
        </li>
        <li>
          <button
            @click="showModal"
            type="button"
            class="relative overflow-hidden rounded bg-neutral-950 px-4 py-1 text-white transition-all duration-300 hover:bg-neutral-800 hover:ring-2 hover:ring-neutral-800 hover:ring-offset-2"
          >
            <i class="fa-solid fa-share hidden lg:inline"></i>
            <span class="relative ml-2">Compartir</span>
          </button>
        </li>
        <li class="flex items-center -space-x-4">
          <button type="button">
            <img
              alt="user 1"
              src="https://raw.githubusercontent.com/creativetimofficial/public-assets/master/soft-ui-dashboard/assets/img/drake.jpg"
              class="relative inline-block h-8 w-8 rounded-full border-2 border-white object-cover object-center hover:z-10 focus:z-10"
            />
          </button>
          <button type="button">
            <img
              alt="user 2"
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1061&amp;q=80"
              class="relative inline-block h-8 w-8 rounded-full border-2 border-white object-cover object-center hover:z-10 focus:z-10"
            />
          </button>
          <button type="button">
            <img
              alt="user 3"
              src="https://raw.githubusercontent.com/creativetimofficial/public-assets/master/soft-ui-dashboard/assets/img/drake.jpg"
              class="relative inline-block h-8 w-8 rounded-full border-2 border-white object-cover object-center hover:z-10 focus:z-10"
            />
          </button>
        </li>
        <li>
          <FwbDropdown placement="left">
            <template #trigger>
              <button type="button" class="px-2 py-1">
                <i class="fa-solid fa-ellipsis-vertical"></i>
              </button>
            </template>

            <FwbListGroup>
              <FwbListGroupItem hover> Generate code </FwbListGroupItem>
              <FwbListGroupItem hover> Show sidebar </FwbListGroupItem>
            </FwbListGroup>
          </FwbDropdown>
        </li>
      </ul>
    </div>
  </div>

  <FwbModal v-if="isShowModal" @close="closeModal">
    <template #header>
      <div class="flex items-center text-lg font-semibold">Share with your team</div>
    </template>
    <template #body>
      <div v-if="isCreatingRoomCode" class="flex justify-center py-4">
        <FwbSpinner size="8" />
      </div>
      <div>
        <p
          v-if="!project.roomCode"
          class="text-base leading-relaxed text-gray-500 dark:text-gray-400"
        >
          Aún no has compartido el proyecto con tu equipo,
          <button
            @click="$emit('createRoomCode')"
            type="button"
            class="font-semibold text-blue-600 dark:text-white hover:underline"
          >
            click aquí
          </button>
          para crear un código de invitación.
        </p>
        <div v-else class="mb-4">
          <div class="my-4">
            <FwbInput
              v-model="project.roomCode"
              label="Room code"
              type="text"
              name="room-code"
              id="room-code"
              autocomplete="off"
              size="lg"
              readonly
            >
              <template #suffix>
                <FwbButton @click="copyRoomCode">
                  <i class="fa-solid fa-copy"></i>
                </FwbButton>
              </template>
            </FwbInput>
          </div>
          <div class="font-semibold my-2">Your team</div>
          <div class="border rounded border-slate-400 p-4">
            <div class="p-4 text-center text-gray-400">
              Looks like nobody joined yet, share your room code, your teammates
              will appear here when they join
            </div>
            <!-- <div>First person</div> -->
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <fwb-button @click="closeModal" color="alternative"> Close </fwb-button>
        <!-- <fwb-button @click="closeModal" color="green"> I accept </fwb-button> -->
      </div>
    </template>
  </FwbModal>
</template>
