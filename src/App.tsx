import { ConfirmationModal } from "./components/ConfirmationModal.tsx";
import { EventsSection } from "./features/lineup/EventsSection.tsx";
import { Header } from "./components/Header.tsx";
import { AthletePool } from "./features/lineup/AthletePool.tsx";
import { RosterManagement } from "./features/lineup/RosterManagement.tsx";
import { AthleteProfile } from "./features/lineup/AthleteProfile.tsx";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { ThemeToggle } from "./components/ThemeToggle.tsx";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="lineup-theme">
      <div className="bg-background text-foreground">
        <div className="container mx-auto p-4 md:p-8">
          <div className="flex justify-end">
            <ThemeToggle />
          </div>
          <Header />
          <div className="flex flex-col md:flex-row gap-8">
            <AthletePool />
            <EventsSection />
          </div>
          <RosterManagement />
          <AthleteProfile />
          <ConfirmationModal />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
