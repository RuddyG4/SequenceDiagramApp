<template>
  <RouterView
    v-if="isDashboardView"
    :user="user"
  />
  <div v-else class="min-h-screen bg-gray-50/50">
    <button @click="toggleSidebar" class="mx-4 mt-2 px-4 py-2 bg-white xl:hidden" type="button">
      <i class="fa fa-bars fa-lg"></i>
    </button>
    <SidebarMenu :isSidebarOpen="isSidebarOpen" @toggleSidebar="toggleSidebar" />
    <div class="p-4 xl:ml-80">
      <RouterView :user="user" />
      <Footer />
    </div>
  </div>
</template>

<script setup>
import SidebarMenu from "@/views/layouts/SidebarMenu.vue";
import Footer from "@/views/layouts/Footer.vue";
import { useRoute } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, computed } from "vue";

const route = useRoute();
const user = ref({});
const isSidebarOpen = ref(false);

const isDashboardView = computed(() => {
  return route.name === "SignIn" || route.name === "register" || route.name === "projects";
});

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
}

onAuthStateChanged(getAuth(), (userData) => {
  if (userData) {
    user.value = userData;
  } else {
    // User is signed out
    console.log("User is signed out");
  }
});
</script>
