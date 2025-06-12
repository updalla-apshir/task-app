"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MailIcon,
  PhoneIcon,
  User2Icon,
  Upload,
  X,
  Camera,
} from "lucide-react";
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
} from "../../../actions/profile";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSchema } from "@/schemas/profile";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    avatarUrl: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form
  const profileForm = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      bio: "",
      avatarUrl: "",
    },
  });

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const result = await getUserProfile();
        if (result.error) {
          toast.error(result.error);
        } else if (result.profile) {
          setProfile(result.profile);
          profileForm.reset({
            fullName: result.profile.fullName || "",
            email: result.profile.email || "",
            phone: result.profile.phone || "",
            bio: result.profile.bio || "",
            avatarUrl: result.profile.avatarUrl || "",
          });
        }
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate image file type
    if (!file.type.startsWith("image/")) {
      toast.error("Selected file is not an image");
      return;
    }

    // Validate file size
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File must be smaller than ${maxSizeMB}MB`);
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      const result = await uploadAvatar(formData);
      if (result.error) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to upload avatar"
        );
      } else if (result.success) {
        toast.success(result.success);
        setProfile((prev) => ({
          ...prev,
          avatarUrl: result.avatarUrl || prev.avatarUrl,
        }));
        profileForm.setValue("avatarUrl", result.avatarUrl || "");
        setAvatarFile(null);
        setAvatarPreview(null);
      }
    } catch (error) {
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  // Clear avatar preview
  const clearAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle profile form submission
  const handleProfileSubmit = async (data: z.infer<typeof ProfileSchema>) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("phone", data.phone || "");
    formData.append("bio", data.bio || "");
    formData.append("avatarUrl", data.avatarUrl || "");

    try {
      const result = await updateUserProfile(formData);
      if (result.error) {
        if (typeof result.error === "string") {
          toast.error(result.error);
        } else {
          // Handle field errors
          Object.entries(result.error).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errors.forEach((error) => {
                profileForm.setError(field as any, { message: error });
              });
            }
          });
        }
      } else if (result.success) {
        toast.success(result.success);
        setProfile({
          ...profile,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone || "",
          bio: data.bio || "",
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className=" mx-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="relative px-6">
          <div className="absolute -top-16 flex items-end gap-4">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
              <AvatarFallback className="text-4xl bg-primary">
                {profile.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">{profile.fullName}</h2>
            </div>
          </div>
        </div>

        <CardContent className="mt-20 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MailIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Bio</p>
              <p>{profile.bio}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button>Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] ">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                    className="space-y-4 pt-4"
                  >
                    <div className="flex flex-col items-center mb-4">
                      {/* Avatar Preview */}
                      <div className="relative">
                        <Avatar className="h-28 w-28 mb-4 border-2 border-primary">
                          <AvatarImage
                            src={
                              avatarPreview ||
                              profileForm.getValues("avatarUrl") ||
                              undefined
                            }
                            alt={profileForm.getValues("fullName") || "User"}
                          />
                          <AvatarFallback className="text-4xl bg-primary text-white">
                            {profileForm
                              .getValues("fullName")
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>

                        {/* Camera overlay button */}
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          className="absolute bottom-3 right-0 rounded-full bg-primary p-2 text-white shadow-md hover:bg-primary/90 transition-colors"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />

                      {/* Avatar actions */}
                      {avatarFile && (
                        <div className="flex flex-col w-full max-w-xs gap-2 mt-2">
                          <div className="flex items-center gap-2 text-sm bg-muted p-2 rounded-md">
                            <div className="flex-1 truncate">
                              {avatarFile.name}
                            </div>
                            <button
                              type="button"
                              onClick={clearAvatarPreview}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <Button
                            size="sm"
                            type="button"
                            onClick={handleAvatarUpload}
                            disabled={isUploading}
                            className="w-full"
                          >
                            {isUploading ? (
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                <span>Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                <span>Upload Avatar</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea rows={4} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          clearAvatarPreview();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
