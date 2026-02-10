import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";

export default function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            FireThunder Demo
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Button variant="contained">MUI Button</Button>
        <div className="mt-6 text-lg font-semibold">Tailwind works correcly</div>
      </Container>
    </>
  );
}
