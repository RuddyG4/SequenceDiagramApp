<template>
  <div class="bg-white mt-6 p-4 rounded shadow-md">
    <div class="flex justify-between">
      <h2 class="text-xl font-semibold">{{ title }}</h2>
      <slot name="headerButton"></slot>
    </div>
    <div
      v-if="isLoading"
      class="mt-4 p-4 py-8 rounded bg-slate-300 flex justify-center shadow-md"
    >
      <FwbSpinner size="10" />
    </div>
    <div
      v-else
      class="mt-4 p-4 rounded bg-slate-300 grid grid-cols-4 lg:grid-cols-5 2xl:grid-cols-7 gap-4 shadow-md"
    >
      <div
        v-if="projectCount === 0"
        class="col-span-4 lg:col-span-5 2xl:col-span-7 p-4 text-center border rounded-lg border-slate-400 hover:border-slate-500"
      >
        <div class="mb-2 text-gray-600 py-6">
          There are no projects to show
        </div>
      </div>
      <template v-else>
        <RouterLink
          v-for="(project, projectKey) in projects"
          :to="{ name: 'projects', params: { projectKey: projectKey } }"
          class="border rounded-lg border-slate-400 hover:border-slate-500"
        >
          <FwbCard
            img-alt="Desk"
            img-src="/assets/images/logo.png"
            variant="image"
          >
            <div class="p-2">
              <h5
                class="mb-2 text-lg font-semibold tracking-tight text-gray-900 dark:text-white"
              >
                {{ project.name }}
              </h5>
              <p class="font-normal text-sm text-gray-500 dark:text-gray-400">
                Editado hace 4 días
              </p>
            </div>
          </FwbCard>
        </RouterLink>
      </template>
    </div>
  </div>
</template>

<script setup>
import { FwbButton, FwbSpinner, FwbCard } from "flowbite-vue";
import { ref, computed } from "vue";

const props = defineProps({
  projects: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
});

const isObjectEmpty = (objectName) => {
  return (
    objectName &&
    Object.keys(objectName).length === 0 &&
    objectName.constructor === Object
  );
};

const projectCount = computed(() => {
  if (isObjectEmpty(props.projects)) {
    return 0;
  }
  return Object.keys(props.projects).length;
});
</script>
