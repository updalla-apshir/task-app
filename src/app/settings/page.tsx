"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LockIcon, ShieldIcon, UserIcon, EyeIcon } from "lucide-react";
import {
  getUserSettings,
  updateAccountSettings,
  updatePassword,
  updateSecuritySettings,
  updatePrivacySettings,
} from "../../../actions/settings";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AccountSettingsSchema,
  PasswordUpdateSchema,
  SecuritySettingsSchema,
  PrivacySettingsSchema,
} from "@/schemas/settings";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type UserState = {
  id: string;
  name: string;
  email: string;
};

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserState | null>(null);
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Forms
  const accountForm = useForm({
    resolver: zodResolver(AccountSettingsSchema),
    defaultValues: {
      email: "",
      username: "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(PasswordUpdateSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const securityForm = useForm({
    resolver: zodResolver(SecuritySettingsSchema),
    defaultValues: {
      twoFactorEnabled: false,
    },
  });

  const privacyForm = useForm({
    resolver: zodResolver(PrivacySettingsSchema),
    defaultValues: {
      accountVisibility: true,
      activityTracking: true,
      dataCollection: true,
    },
  });

  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const result = await getUserSettings();
        if (result.error) {
          toast.error(result.error);
        } else if (result.user) {
          setUser({
            id: result.user.id,
            name: result.user.name || "",
            email: result.user.email || "",
          });
          accountForm.reset({
            email: result.user.email || "",
            username: result.user.name || "",
          });
        }
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle account form submission
  const handleAccountSubmit = async (
    data: z.infer<typeof AccountSettingsSchema>
  ) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("username", data.username);

    try {
      const result = await updateAccountSettings(formData);
      if (result.error) {
        if (typeof result.error === "string") {
          toast.error(result.error);
        } else {
          // Handle field errors
          Object.entries(result.error).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errors.forEach((error) => {
                accountForm.setError(field as any, { message: error });
              });
            }
          });
        }
      } else if (result.success) {
        toast.success(result.success);
        // Update local user state
        setUser((prev) =>
          prev ? { ...prev, name: data.username, email: data.email } : null
        );
      }
    } catch (error) {
      toast.error("Failed to update account settings");
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = passwordForm.getValues();
    const formData = new FormData();
    formData.append("currentPassword", data.currentPassword);
    formData.append("newPassword", data.newPassword);
    formData.append("confirmPassword", data.confirmPassword);

    try {
      const result = await updatePassword(formData);
      if (result.error) {
        if (typeof result.error === "string") {
          toast.error(result.error);
        } else {
          // Handle field errors
          Object.entries(result.error).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              errors.forEach((error) => {
                passwordForm.setError(field as any, { message: error });
              });
            }
          });
        }
      } else if (result.success) {
        toast.success(result.success);
        setPasswordChangeMode(false);
        passwordForm.reset();
      }
    } catch (error) {
      toast.error("Failed to update password");
    }
  };

  // Handle security form submission
  const handleSecuritySubmit = async (
    data: z.infer<typeof SecuritySettingsSchema>
  ) => {
    // Toggle the value before sending to the server
    const newTwoFactorState = !twoFactorEnabled;

    const formData = new FormData();
    formData.append("twoFactorEnabled", newTwoFactorState.toString());

    try {
      const result = await updateSecuritySettings(formData);
      if (result.error) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update security settings"
        );
      } else if (result.success) {
        toast.success(result.success);
        // Update the state with the new value
        setTwoFactorEnabled(newTwoFactorState);
        // Also update the form value
        securityForm.setValue("twoFactorEnabled", newTwoFactorState);
      }
    } catch (error) {
      toast.error("Failed to update security settings");
    }
  };

  // Handle privacy form submission
  const handlePrivacySubmit = async (
    data: z.infer<typeof PrivacySettingsSchema>
  ) => {
    const formData = new FormData();
    formData.append("accountVisibility", data.accountVisibility.toString());
    formData.append("activityTracking", data.activityTracking.toString());
    formData.append("dataCollection", data.dataCollection.toString());

    try {
      const result = await updatePrivacySettings(formData);
      if (result.error) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update privacy settings"
        );
      } else if (result.success) {
        toast.success(result.success);
      }
    } catch (error) {
      toast.error("Failed to update privacy settings");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...accountForm}>
              <form
                onSubmit={accountForm.handleSubmit(handleAccountSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={accountForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  {passwordChangeMode ? (
                    <Form {...passwordForm}>
                      <div className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2">
                          <Button type="button" onClick={handlePasswordSubmit}>
                            Update Password
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setPasswordChangeMode(false);
                              passwordForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Form>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        id="password"
                        type="password"
                        value="••••••••"
                        disabled
                      />
                      <Button
                        variant="outline"
                        onClick={() => setPasswordChangeMode(true)}
                      >
                        Change
                      </Button>
                    </div>
                  )}
                </div>

                {!passwordChangeMode && (
                  <Button type="submit" className="w-full">
                    Save Changes
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ShieldIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...securityForm}>
              <form
                onSubmit={securityForm.handleSubmit(handleSecuritySubmit)}
                className="space-y-4"
              >
                <FormField
                  control={securityForm.control}
                  name="twoFactorEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Two-Factor Authentication (2FA)</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={twoFactorEnabled}
                          onCheckedChange={(checked) => {
                            // Don't update the form value here, just update the UI state
                            // The form submission will handle the actual change
                            setTwoFactorEnabled(checked);
                            field.onChange(checked);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="rounded-md bg-muted p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">2FA Status</p>
                    <p className="text-sm text-muted-foreground">
                      {twoFactorEnabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <div
                    className={`h-3 w-3 rounded-full ${twoFactorEnabled ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                </div>
                <Button
                  type="button"
                  variant={twoFactorEnabled ? "destructive" : "default"}
                  className="w-full"
                  onClick={() => handleSecuritySubmit({ twoFactorEnabled })}
                >
                  {twoFactorEnabled ? "Disable 2FA" : "Setup 2FA"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2">
            <EyeIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>Control your privacy settings</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...privacyForm}>
              <form
                onSubmit={privacyForm.handleSubmit(handlePrivacySubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <FormField
                    control={privacyForm.control}
                    name="accountVisibility"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Account Visibility</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Allow others to find and view your profile
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={privacyForm.control}
                    name="activityTracking"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Activity Tracking</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Allow us to track your activity to improve your
                            experience
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={privacyForm.control}
                    name="dataCollection"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Data Collection</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Allow us to collect anonymous usage data
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Save Privacy Settings
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
