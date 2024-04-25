import { createRouter, createWebHistory } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/Profile.vue"),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/auth/Register.vue"),
    },
    {
      path: "/sign-in",
      name: "SignIn",
      component: () => import("../views/auth/SignIn.vue"),
    },
    {
      path: "/your-projects",
      name: "your-projects",
      component: () => import("../views/RecentProjects.vue"),
      meta: {
        requiresAuth: true
      }
    },
    {
      // path: "/project",
      path: "/projects/:projectKey",
      name: "projects",
      component: () => import("../views/Project.vue"),
      meta: {
        requiresAuth: true
      }
    },
  ],
});

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener();
        resolve(user);
      },
      reject
    );
  });
}

router.beforeEach(async (to, from) => {
  const user = await getCurrentUser();
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!user) {
      return { name: "SignIn" };
    }
  }
});

export default router;
