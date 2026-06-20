// import { getCurrent } from "@/features/auth/query";
import { RegisterComponent } from "@/features/auth/components/register";
import RegisterWrapper from "@/features/auth/components/registerWrapper";
import { redirect } from "next/navigation";

// import { SignUpCard } from "@/features/auth/components/sign-up-card";

const RegisterPage = async () => {
  // const user = await getCurrent();
  // if (user) {
  //   redirect("/workspaces");
  // }
  return <RegisterWrapper />;
};

export default RegisterPage;
