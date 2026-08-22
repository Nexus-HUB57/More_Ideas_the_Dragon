import { DashboardLayout } from "@/components/DashboardLayout";
import { Route, Switch } from "wouter";
import AdminHome from "./admin/AdminHome";
import AffiliatesManagement from "./admin/AffiliatesManagement";
import SalesManagement from "./admin/SalesManagement";
import ProductsManagement from "./admin/ProductsManagement";
import PaymentsManagement from "./admin/PaymentsManagement";
import LotteriesManagement from "./admin/LotteriesManagement";

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/admin" component={AdminHome} />
        <Route path="/admin/affiliates" component={AffiliatesManagement} />
        <Route path="/admin/sales" component={SalesManagement} />
        <Route path="/admin/products" component={ProductsManagement} />
        <Route path="/admin/payments" component={PaymentsManagement} />
        <Route path="/admin/lotteries" component={LotteriesManagement} />
      </Switch>
    </DashboardLayout>
  );
}
