import {currentUser} from '@/lib/auth';
import LandingExperience from '@/components/LandingExperience';

export default async function Home(){
  const user=await currentUser();
  return <LandingExperience signedIn={Boolean(user)}/>;
}
