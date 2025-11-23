import { InsuranceListContextType, TaxLevelListContextType, CreateTaxLevelRequest, CreateInsurancePolicyRequest } from "./types";

export async function fetchTaxLevels (context: TaxLevelListContextType | undefined, setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
  try {
    const token = sessionStorage.getItem("scpm.auth.token");
    const response = await fetch("http://localhost:8080/api/config/tax-level", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await response.json();
    context?.setTaxLevels(data);
  } catch (error) {
    console.error("Error fetching tax levels:", error);
  } finally {
    setLoading(false);
  }
};

export async function createTaxLevel(data: CreateTaxLevelRequest): Promise<boolean> {
  try {
    const token = sessionStorage.getItem("scpm.auth.token");
    const response = await fetch("http://localhost:8080/api/config/tax-level", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error("Error creating tax level:", error);
    return false;
  }
}

export async function updateTaxLevel(id: number, data: CreateTaxLevelRequest): Promise<boolean> {
  try {
    const token = sessionStorage.getItem("scpm.auth.token");
    const response = await fetch(`http://localhost:8080/api/config/tax-level/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error("Error updating tax level:", error);
    return false;
  }
}

export async function deleteTaxLevel(id: number): Promise<boolean> {
  try {
    const token = sessionStorage.getItem("scpm.auth.token");
    const response = await fetch(`http://localhost:8080/api/config/tax-level/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting tax level:", error);
    return false;
  }
}

export async function fetchInsurancePolicies (context: InsuranceListContextType | undefined, setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
  try {
    const token = sessionStorage.getItem("scpm.auth.token");
    const response = await fetch("http://localhost:8080/api/config/insurance-policy", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await response.json();
    context?.setInsurancePolicies(data);
  } catch (error) {
    console.error("Error fetching tax levels:", error);
  } finally {
    setLoading(false);
  }
}

export async function createInsurancePolicy(data: CreateInsurancePolicyRequest): Promise<boolean> {
  try {
    const token = sessionStorage.getItem("scpm.auth.token");
    const response = await fetch("http://localhost:8080/api/config/insurance-policy", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error("Error creating insurance policy:", error);
    return false;
  }
}

export async function updateInsurancePolicy(id: number, data: CreateInsurancePolicyRequest): Promise<boolean> {
  try {
    const token = sessionStorage.getItem("scpm.auth.token");
    const response = await fetch(`http://localhost:8080/api/config/insurance-policy/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error("Error updating insurance policy:", error);
    return false;
  }
}

export async function deleteInsurancePolicy(id: number): Promise<boolean> {
  try {
    const token = sessionStorage.getItem("scpm.auth.token");
    const response = await fetch(`http://localhost:8080/api/config/insurance-policy/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting insurance policy:", error);
    return false;
  }
}