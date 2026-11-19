import LoginForm from "./form";
export default function LoginPage(){ return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:20}}>
  <div className="panel" style={{width:"min(420px,100%)",padding:30}}>
    <div className="eyebrow">MAYAKAS MANAGEMENT SYSTEM</div><h1>Welcome back</h1>
    <p className="sub">Sign in to your school workspace.</p><LoginForm/>
    <p className="sub" style={{marginTop:20}}>Demo accounts are created by the database seed script. Change all demo passwords before deployment.</p>
  </div></main>; }
