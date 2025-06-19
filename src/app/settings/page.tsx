"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ShieldIcon, EyeIcon, CrownIcon, CreditCardIcon } from "lucide-react";
import {
  getUserSettings,
  updatePrivacySettings,
  updateSecuritySettings,
  upgradeToPremium,
} from "../../../actions/settings";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SecuritySettingsSchema,
  PrivacySettingsSchema,
  PremiumUpgradeSchema,
} from "@/schemas/settings";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { TableSkeleton } from "@/components/ui/skeletons";
import { userdata } from "../../../actions/sign-in";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Import Role enum from a shared types file
type Role = "User" | "Premium" | "Team_Member";

type UserState = {
  id: string;
  name: string;
  email: string;
  role?: Role | null;
};

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserState | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);

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

  const premiumForm = useForm({
    resolver: zodResolver(PremiumUpgradeSchema),
    defaultValues: {
      fullName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const result = await getUserSettings();
        if (result.error) {
          toast.error(result.error);
        } else if (result.user) {
          const userEmail = result.user.email || "";
          setUser({
            id: result.user.id,
            name: result.user.name || "",
            email: userEmail,
            role: result.user.role,
          });

          // Check if user is premium from getUserSettings
          setIsPremium(result.user.role === "Premium");

          // 🔁 Get 2FA status from DB
          const user2faData = await userdata(userEmail);
          const is2faEnabled =
            user2faData?.enableTwoFactorAuthentication ?? false;

          setTwoFactorEnabled(is2faEnabled);
          securityForm.setValue("twoFactorEnabled", is2faEnabled);
        }
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSecuritySubmit = async (
    data: z.infer<typeof SecuritySettingsSchema>
  ) => {
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("twoFactorEnabled", data.twoFactorEnabled.toString());

    try {
      const result = await updateSecuritySettings(formData);

      if (result.error) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to update security settings"
        );
        
        // Revert form value to match the server state
        securityForm.setValue("twoFactorEnabled", twoFactorEnabled);
      } else if (result.success) {
        toast.success(result.success);
        
        // Only update UI after successful server response
        setTwoFactorEnabled(result.twoFactorEnabled);
      }
    } catch (error) {
      toast.error("Failed to update security settings");
      // Revert form value to match the server state
      securityForm.setValue("twoFactorEnabled", twoFactorEnabled);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handlePremiumSubmit = async (
    data: z.infer<typeof PremiumUpgradeSchema>
  ) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("cardNumber", data.cardNumber);
    formData.append("expiryDate", data.expiryDate);
    formData.append("cvv", data.cvv);

    try {
      const result = await upgradeToPremium(formData);

      if (result.error) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to upgrade to premium"
        );
      } else if (result.success) {
        toast.success(result.success);
        setIsPremium(result.role === "Premium");
        setIsPremiumDialogOpen(false);
        premiumForm.reset();
      }
    } catch (error) {
      toast.error("Failed to upgrade to premium");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="mx-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        {!isPremium && (
          <Button 
            onClick={() => setIsPremiumDialogOpen(true)} 
            className="bg-gradient-to-r from-amber-500 to-amber-300 hover:from-amber-600 hover:to-amber-400"
          >
            <CrownIcon className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
        )}
        {isPremium && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-300 rounded-md text-white">
            <CrownIcon className="h-4 w-4" />
            <span className="font-medium">Premium Member</span>
          </div>
        )}
      </div>

      {/* Premium Upgrade Dialog */}
      <Dialog open={isPremiumDialogOpen} onOpenChange={setIsPremiumDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CrownIcon className="h-5 w-5 text-amber-500" />
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription>
              Get access to premium features and benefits
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-amber-50 rounded-md mb-4">
            <h3 className="font-semibold text-amber-800 mb-2">Premium Benefits:</h3>
            <ul className="space-y-1 text-amber-700 text-sm">
              <li>• Unlimited projects and tasks</li>
              <li>• Advanced analytics and reporting</li>
              <li>• Priority customer support</li>
              <li>• Custom themes and branding</li>
              <li>• Team collaboration features</li>
            </ul>
            <p className="mt-3 text-sm font-medium text-amber-800">Only $9.99/month</p>
          </div>
          <Form {...premiumForm}>
            <form onSubmit={premiumForm.handleSubmit(handlePremiumSubmit)} className="space-y-4">
              <FormField
                control={premiumForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={premiumForm.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input placeholder="4242 4242 4242 4242" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={premiumForm.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input placeholder="MM/YY" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={premiumForm.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input placeholder="123" type="password" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-500 to-amber-300 hover:from-amber-600 hover:to-amber-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                This is a demo. No actual payment will be processed.
              </p>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:grid-cols-1">
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
                          checked={field.value}
                          disabled={isSubmitting}
                          onCheckedChange={(checked) => {
                            // Only update form value, not the state
                            field.onChange(checked);
                            // Submit the form automatically
                            setTimeout(() => {
                              securityForm.handleSubmit(handleSecuritySubmit)();
                            }, 0);
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
                    className={`h-3 w-3 rounded-full ${
                      twoFactorEnabled ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  variant={twoFactorEnabled ? "destructive" : "default"}
                  disabled={isSubmitting}
                  onClick={() => {
                    // Toggle the value in the form and trigger the submit
                    const newValue = !securityForm.getValues().twoFactorEnabled;
                    securityForm.setValue("twoFactorEnabled", newValue);
                    securityForm.handleSubmit(handleSecuritySubmit)();
                  }}
                >
                  {isSubmitting ? "Updating..." : (twoFactorEnabled ? "Disable 2FA" : "Setup 2FA")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
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
