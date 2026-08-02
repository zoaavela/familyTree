import { Button, Input, Card, Label } from '@familytree/ui';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-80">
        <Label htmlFor="test">Nom</Label>
        <Input id="test" placeholder="Ton nom" className="mb-4" />
        <Button>Valider</Button>
      </Card>
    </div>
  );
}

export default App;