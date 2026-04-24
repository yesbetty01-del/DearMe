import { createContext, useContext, useState } from 'react';

export const ProfileContext = createContext();

export default function ProfileProvider({children}) {
  const [name , setName ] = useState("");

  const value = {name, setName};
    return(
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    )
}

export const useProfile = () => {
    const context = useContext(ProfileContext);
    return context;
}