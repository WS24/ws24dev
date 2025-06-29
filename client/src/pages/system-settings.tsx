import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Upload, Globe, Mail, User, Shield, FileText, Image, Database } from "lucide-react";

const SystemSettingsMenu = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => (
  <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
    <Button
      variant={activeTab === "general" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("general")}
      className="flex items-center gap-2"
    >
      <Settings className="h-4 w-4" />
      General
    </Button>
    <Button
      variant={activeTab === "site" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("site")}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      Site Config
    </Button>
    <Button
      variant={activeTab === "files" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("files")}
      className="flex items-center gap-2"
    >
      <Upload className="h-4 w-4" />
      File Settings
    </Button>
    <Button
      variant={activeTab === "users" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("users")}
      className="flex items-center gap-2"
    >
      <User className="h-4 w-4" />
      User Defaults
    </Button>
    <Button
      variant={activeTab === "security" ? "default" : "ghost"}
      size="sm"
      onClick={() => onTabChange("security")}
      className="flex items-center gap-2"
    >
      <Shield className="h-4 w-4" />
      Security
    </Button>
  </div>
);

const systemSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().optional(),
  siteEmail: z.string().email("Invalid email address"),
  siteTheme: z.string().min(1, "Theme is required"),
  logoType: z.enum(["text", "image"]),
  logoWidth: z.number().min(1, "Logo width must be positive"),
  logoHeight: z.number().min(1, "Logo height must be positive"),
  uploadPath: z.string().min(1, "Upload path is required"),
  relativeUploadPath: z.string().optional(),
  allowedFileTypes: z.string().min(1, "Allowed file types are required"),
  maxFileSize: z.number().min(1, "Max file size must be positive"),
  dashboardNotes: z.string().optional(),
  defaultUserRole: z.enum(["client", "specialist", "admin"]),
  disableRegistration: z.boolean(),
  recaptchaSecretKey: z.string().optional(),
  recaptchaSiteKey: z.string().optional(),
  allowAvatarUpload: z.boolean(),
  passwordBruteForceProtection: z.boolean(),
  emailAccountActivation: z.boolean(),
});

type SystemSettings = z.infer<typeof systemSettingsSchema>;

export default function SystemSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings, isLoading } = useQuery<SystemSettings>({
    queryKey: ["/api/system-settings"],
    retry: false,
  });

  const form = useForm<SystemSettings>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      siteName: settings?.siteName || "TaskFlow Pro",
      siteDescription: settings?.siteDescription || "",
      siteEmail: settings?.siteEmail || "admin@taskflow.com",
      siteTheme: settings?.siteTheme || "default",
      logoType: settings?.logoType || "text",
      logoWidth: settings?.logoWidth || 200,
      logoHeight: settings?.logoHeight || 50,
      uploadPath: settings?.uploadPath || "/uploads",
      relativeUploadPath: settings?.relativeUploadPath || "",
      allowedFileTypes: settings?.allowedFileTypes || "jpg,jpeg,png,gif,pdf,doc,docx",
      maxFileSize: settings?.maxFileSize || 10,
      dashboardNotes: settings?.dashboardNotes || "",
      defaultUserRole: settings?.defaultUserRole || "client",
      disableRegistration: settings?.disableRegistration || false,
      recaptchaSecretKey: settings?.recaptchaSecretKey || "",
      recaptchaSiteKey: settings?.recaptchaSiteKey || "",
      allowAvatarUpload: settings?.allowAvatarUpload || true,
      passwordBruteForceProtection: settings?.passwordBruteForceProtection || true,
      emailAccountActivation: settings?.emailAccountActivation || false,
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SystemSettings) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      await apiRequest("PUT", "/api/system-settings", formData);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "System settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SystemSettings) => {
    updateSettingsMutation.mutate(data);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex">
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">System Settings</h1>
                <p className="text-gray-600">Configure your platform settings and preferences</p>
              </div>
            </div>

            <SystemSettingsMenu activeTab={activeTab} onTabChange={setActiveTab} />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* General Settings */}
                {activeTab === "general" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        General Settings
                      </CardTitle>
                      <CardDescription>
                        Basic platform configuration
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter site name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="siteDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Brief description of your site" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="siteTheme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Theme</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="light">Light</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Site Configuration */}
                {activeTab === "site" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Site Configuration
                      </CardTitle>
                      <CardDescription>
                        Website information and branding
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="siteEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="admin@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="logoType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select logo type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="text">Text Logo</SelectItem>
                                <SelectItem value="image">Image Logo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="logoWidth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo Width (px)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="logoHeight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo Height (px)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* File Settings */}
                {activeTab === "files" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        File Upload Settings
                      </CardTitle>
                      <CardDescription>
                        Configure file upload restrictions and paths
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="uploadPath"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Upload Path</FormLabel>
                            <FormControl>
                              <Input placeholder="/uploads" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="allowedFileTypes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allowed File Types</FormLabel>
                            <FormControl>
                              <Input placeholder="jpg,jpeg,png,gif,pdf,doc,docx" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxFileSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max File Size (MB)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* User Defaults */}
                {activeTab === "users" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        User Defaults
                      </CardTitle>
                      <CardDescription>
                        Default settings for new users
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="defaultUserRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default User Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select default role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="client">Client</SelectItem>
                                <SelectItem value="specialist">Specialist</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="disableRegistration"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Disable Registration</FormLabel>
                              <div className="text-sm text-gray-600">
                                Prevent new user registrations
                              </div>
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

                      <FormField
                        control={form.control}
                        name="allowAvatarUpload"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Allow Avatar Upload</FormLabel>
                              <div className="text-sm text-gray-600">
                                Allow users to upload profile pictures
                              </div>
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
                    </CardContent>
                  </Card>
                )}

                {/* Security Settings */}
                {activeTab === "security" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>
                        Security and protection configurations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="passwordBruteForceProtection"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Brute Force Protection</FormLabel>
                              <div className="text-sm text-gray-600">
                                Enable protection against password attacks
                              </div>
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

                      <FormField
                        control={form.control}
                        name="emailAccountActivation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Account Activation</FormLabel>
                              <div className="text-sm text-gray-600">
                                Require email verification for new accounts
                              </div>
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

                      <FormField
                        control={form.control}
                        name="recaptchaSecretKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Google reCAPTCHA Secret Key</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter secret key" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="recaptchaSiteKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Google reCAPTCHA Site Key</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter site key" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateSettingsMutation.isPending}
                    className="min-w-32"
                  >
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}