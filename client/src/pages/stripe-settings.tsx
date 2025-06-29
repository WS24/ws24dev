import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigation } from "@/components/layout/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard,
  Key,
  Settings,
  Shield,
  DollarSign,
  Globe,
  Bell,
  CheckCircle
} from "lucide-react";

const stripeSettingsSchema = z.object({
  publicKey: z.string().min(1, "Public key is required").startsWith("pk_", "Must start with pk_"),
  secretKey: z.string().min(1, "Secret key is required").startsWith("sk_", "Must start with sk_"),
  webhookSecret: z.string().optional(),
  currency: z.string().default("usd"),
  paymentMethods: z.array(z.string()).default(["card"]),
  automaticTax: z.boolean().default(false),
  saveCards: z.boolean().default(true),
  requireBillingAddress: z.boolean().default(false),
  enableSubscriptions: z.boolean().default(true),
  testMode: z.boolean().default(false),
});

type StripeSettings = z.infer<typeof stripeSettingsSchema>;

export default function StripeSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");

  const form = useForm<StripeSettings>({
    resolver: zodResolver(stripeSettingsSchema),
    defaultValues: {
      publicKey: "",
      secretKey: "",
      webhookSecret: "",
      currency: "usd",
      paymentMethods: ["card"],
      automaticTax: false,
      saveCards: true,
      requireBillingAddress: false,
      enableSubscriptions: true,
      testMode: false,
    },
  });

  const onSubmit = async (data: StripeSettings) => {
    setIsLoading(true);
    try {
      // Save Stripe settings
      const response = await fetch("/api/admin/stripe-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setConnectionStatus("connected");
      toast({
        title: "Settings Saved",
        description: "Stripe payment settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Stripe settings. Please check your keys.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setConnectionStatus("testing");
    try {
      const formData = form.getValues();
      const response = await fetch("/api/admin/stripe-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: formData.publicKey,
          secretKey: formData.secretKey,
        }),
      });

      if (response.ok) {
        setConnectionStatus("connected");
        toast({
          title: "Connection Successful",
          description: "Stripe API keys are valid and working.",
        });
      } else {
        setConnectionStatus("disconnected");
        toast({
          title: "Connection Failed",
          description: "Invalid Stripe API keys or connection error.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus("disconnected");
      toast({
        title: "Connection Error",
        description: "Unable to test Stripe connection.",
        variant: "destructive",
      });
    }
  };

  const StatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "testing":
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex">
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Stripe Payment Settings</h1>
                  <p className="text-gray-600">Configure your Stripe payment processing</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <StatusIcon />
                <span className="text-sm font-medium">
                  {connectionStatus === "connected" ? "Connected" : 
                   connectionStatus === "testing" ? "Testing..." : "Disconnected"}
                </span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* API Keys Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      API Keys
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="publicKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publishable Key</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="pk_test_..." 
                              {...field} 
                              className="font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-gray-600">
                            Your Stripe publishable key (starts with pk_). Safe to use in client-side code.
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secretKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secret Key</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="sk_test_..." 
                              {...field} 
                              className="font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-gray-600">
                            Your Stripe secret key (starts with sk_). Keep this secure and private.
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="webhookSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook Endpoint Secret (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="whsec_..." 
                              {...field} 
                              className="font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-gray-600">
                            Webhook signing secret for secure event verification.
                          </p>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={testConnection}>
                        Test Connection
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Payment Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="usd">USD - US Dollar</SelectItem>
                              <SelectItem value="eur">EUR - Euro</SelectItem>
                              <SelectItem value="gbp">GBP - British Pound</SelectItem>
                              <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                              <SelectItem value="aud">AUD - Australian Dollar</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="saveCards"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Save Payment Methods</FormLabel>
                              <p className="text-sm text-gray-600">
                                Allow customers to save cards for future payments
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

                      <FormField
                        control={form.control}
                        name="requireBillingAddress"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require Billing Address</FormLabel>
                              <p className="text-sm text-gray-600">
                                Collect billing address for all payments
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

                      <FormField
                        control={form.control}
                        name="automaticTax"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Automatic Tax Calculation</FormLabel>
                              <p className="text-sm text-gray-600">
                                Enable Stripe Tax for automatic tax calculation
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

                      <FormField
                        control={form.control}
                        name="enableSubscriptions"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Subscriptions</FormLabel>
                              <p className="text-sm text-gray-600">
                                Allow recurring subscription payments
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
                  </CardContent>
                </Card>

                {/* Test Mode */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Development Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="testMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Test Mode</FormLabel>
                            <p className="text-sm text-gray-600">
                              Use test API keys for development and testing
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
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline">
                    Reset to Defaults
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Settings"}
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