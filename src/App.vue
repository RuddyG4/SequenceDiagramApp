<template>
  <RouterView
    v-if="isDashboardView"
    :userUid="userUid"
  />
  <div v-else class="min-h-screen bg-gray-50/50">
    <SidebarMenu />
    <div class="p-4 xl:ml-80">
      <RouterView :userUid="userUid" />
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
const userUid = ref(null);

const isDashboardView = computed(() => {
  return route.name === "SignIn" || route.name === "register" || route.name === "projects";
});

onAuthStateChanged(getAuth(), (user) => {
  if (user) {
    userUid.value = user.uid;
    console.log("User is signed in");
  } else {
    // User is signed out
    console.log("User is signed out");
  }
});
</script>
