"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setUserData } from "@/store/userSlice";
import { getCurrentUser } from "@/services/authService";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import Artifact from "@/components/Artifact";

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        dispatch(
          setUserData(
            data || {
              userId: "guest-user-123",
              name: "Cortex User",
              email: "user@cortex.ai",
              avatar: "",
            }
          )
        );
      } catch {
        dispatch(
          setUserData({
            userId: "guest-user-123",
            name: "Cortex User",
            email: "user@cortex.ai",
            avatar: "",
          })
        );
      }
    };

    fetchUser();
  }, [dispatch]);

  return (
    <div className="flex h-screen w-full bg-[#f5f5f5] overflow-hidden text-[#0c0a09]">
      <Sidebar />
      <ChatArea />
      <Artifact />
    </div>
  );
}
