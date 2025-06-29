import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Settings, Upload, Globe, Mail, User, Shield, FileText, Image } from "lucide-react";

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

  const { data: settings, isLoading } = useQuery<SystemSettings>({
    queryKey: ["/api/system-settings"],
    retry: false,
  });

  const form = useForm<SystemSettings>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      siteName: settings?.siteName || "eCommerce Решения WS24.pro",
      siteDescription: settings?.siteDescription || "",
      siteEmail: settings?.siteEmail || "ticket@ws24.pro",
      siteTheme: settings?.siteTheme || "Titan",
      logoType: settings?.logoType || "text",
      logoWidth: settings?.logoWidth || 93,
      logoHeight: settings?.logoHeight || 32,
      uploadPath: settings?.uploadPath || "/srv/html/helpdesk/public_html/uploads",
      relativeUploadPath: settings?.relativeUploadPath || "",
      allowedFileTypes: settings?.allowedFileTypes || "txt|gif|png|jpg|jpeg|pdf|doc|docx|xls|xlsx|txt|csv|ppt|zip|mov|mpeg|mp4|avi|zip|rar|tar|7z|gzip|psd|html|xml|json",
      maxFileSize: settings?.maxFileSize || 1181929,
      dashboardNotes: settings?.dashboardNotes || "",
      defaultUserRole: settings?.defaultUserRole || "client",
      disableRegistration: settings?.disableRegistration || false,
      recaptchaSecretKey: settings?.recaptchaSecretKey || "",
      recaptchaSiteKey: settings?.recaptchaSiteKey || "",
      allowAvatarUpload: settings?.allowAvatarUpload !== undefined ? settings.allowAvatarUpload : true,
      passwordBruteForceProtection: settings?.passwordBruteForceProtection !== undefined ? settings.passwordBruteForceProtection : true,
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-gray-600">Configure your platform settings and preferences</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Site Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Site Information
              </CardTitle>
              <CardDescription>
                Basic information about your website
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
                name="siteEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ticket@example.com" {...field} />
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
                    <FormControl>
                      <Input placeholder="Titan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Logo Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Logo Settings
              </CardTitle>
              <CardDescription>
                Configure your site logo and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label>Logo File</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                  <span className="text-sm text-gray-500">
                    {logoFile ? logoFile.name : "No file chosen"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="logoWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo Width</FormLabel>
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
                      <FormLabel>Logo Height</FormLabel>
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

          {/* File Upload Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                File Upload Settings
              </CardTitle>
              <CardDescription>
                Configure file upload paths and restrictions
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
                      <Input placeholder="/srv/html/helpdesk/public_html/uploads" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relativeUploadPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relative Upload Path</FormLabel>
                    <FormControl>
                      <Input placeholder="uploads/" {...field} />
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
                      <Input placeholder="txt|gif|png|jpg|jpeg|pdf|doc" {...field} />
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
                    <FormLabel>Max File Size (bytes)</FormLabel>
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

          {/* User Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Settings
              </CardTitle>
              <CardDescription>
                Configure user registration and default settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="dashboardNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dashboard Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notes displayed on dashboard" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="disableRegistration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Disable Registration</FormLabel>
                        <div className="text-sm text-gray-600">
                          Prevents users from registering on the site
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
                          Allows users to upload custom avatars
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
                          Requires email verification for new accounts
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
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security features and protections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="passwordBruteForceProtection"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Password Brute Force Protection</FormLabel>
                      <div className="text-sm text-gray-600">
                        Blocks users after 5 failed attempts for 15 minutes
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

              <div className="space-y-4">
                <h4 className="text-lg font-medium">Google reCAPTCHA</h4>
                <p className="text-sm text-gray-600">
                  Google reCAPTCHA is a much more advanced captcha option. You'll need to have a Google API KEY pair in order to set this up.
                </p>

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
              </div>
            </CardContent>
          </Card>

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
  );
}