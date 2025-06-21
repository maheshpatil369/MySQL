import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join PlanPal Pro and start planning incredible journeys with your team"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;