import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Zap, Shield, ArrowRight } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TaskFlow Pro</span>
          </div>
          <Button onClick={handleLogin} className="bg-primary hover:bg-blue-700">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Professional Web Development Services
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Expert Help for Your
            <span className="text-primary block">Web Development Projects</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with skilled specialists, get accurate project evaluations, and track your development tasks from start to finish.
          </p>
          <Button 
            onClick={handleLogin} 
            size="lg" 
            className="bg-primary hover:bg-blue-700 text-lg px-8 py-3"
          >
            Get Started Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Specialists</h3>
              <p className="text-gray-600">
                Access a network of vetted web development specialists ready to help with your projects.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fast Evaluations</h3>
              <p className="text-gray-600">
                Get accurate project estimates and timelines from specialists within hours.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
              <p className="text-gray-600">
                Transparent billing and secure payment processing for peace of mind.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Create Task</h3>
              <p className="text-gray-600 text-sm">Describe your web development needs</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Get Evaluation</h3>
              <p className="text-gray-600 text-sm">Specialists provide detailed estimates</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Approve & Pay</h3>
              <p className="text-gray-600 text-sm">Review and approve the project scope</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm">Monitor your project to completion</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Why Choose TaskFlow Pro?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-success mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Vetted Professionals</h3>
                      <p className="text-gray-600">All specialists are thoroughly screened and verified</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-success mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Transparent Pricing</h3>
                      <p className="text-gray-600">No hidden fees, clear project estimates upfront</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-success mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Quality Assurance</h3>
                      <p className="text-gray-600">Every project is reviewed and tested before delivery</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-success mt-0.5" />
                    <div>
                      <h3 className="font-semibold">24/7 Support</h3>
                      <p className="text-gray-600">Get help whenever you need it throughout your project</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of businesses who trust TaskFlow Pro for their web development needs.
                </p>
                <Button 
                  onClick={handleLogin} 
                  size="lg" 
                  className="bg-primary hover:bg-blue-700"
                >
                  Sign In Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 TaskFlow Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
