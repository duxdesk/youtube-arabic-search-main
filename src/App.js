"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var toaster_1 = require("@/components/ui/toaster");
var sonner_1 = require("@/components/ui/sonner");
var tooltip_1 = require("@/components/ui/tooltip");
var react_query_1 = require("@tanstack/react-query");
var react_router_dom_1 = require("react-router-dom");
var Index_1 = require("./pages/Index");
var Search_1 = require("./pages/Search");
var Auth_1 = require("./pages/Auth"); // Added from remote for auth flows
var Dashboard_1 = require("./pages/Dashboard");
var Creators_1 = require("./pages/Creators");
var Manage_1 = require("./pages/Manage");
var NotFound_1 = require("./pages/NotFound");
var queryClient = new react_query_1.QueryClient();
var App = function () { return (<react_query_1.QueryClientProvider client={queryClient}>
    <tooltip_1.TooltipProvider>
      <toaster_1.Toaster />
      <sonner_1.Toaster />
      <react_router_dom_1.BrowserRouter>
        <react_router_dom_1.Routes>
          <react_router_dom_1.Route path="/" element={<Index_1.default />}/>
          <react_router_dom_1.Route path="/search/:youtuberId" element={<Search_1.default />}/>
          <react_router_dom_1.Route path="/auth" element={<Auth_1.default />}/>  {/* Added from remote */}
          <react_router_dom_1.Route path="/dashboard" element={<Dashboard_1.default />}/>
          <react_router_dom_1.Route path="/creators" element={<Creators_1.default />}/>
          <react_router_dom_1.Route path="/manage" element={<Manage_1.default />}/>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <react_router_dom_1.Route path="*" element={<NotFound_1.default />}/>
        </react_router_dom_1.Routes>
      </react_router_dom_1.BrowserRouter>
    </tooltip_1.TooltipProvider>
  </react_query_1.QueryClientProvider>); };
exports.default = App;
