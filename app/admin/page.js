import AdminClient from "../../src/components/AdminClient";

export const metadata = {
  title: "Admin — AIArsenal",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
