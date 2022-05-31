import {
    Button,
    NavigationButton,
    RequestManager,
    SourceStateManager,
} from "paperback-extensions-common";
import {
    retrieveStateData,
    setStateData,
    getKomgaAPI,
    getAuthorizationString,
} from "./Common";

/* Helper functions */

export const testServerSettings = async (
    stateManager: SourceStateManager,
    requestManager: RequestManager
): Promise<string> => {
    // Try to establish a connection with the server. Return an human readable string containing the test result

    const komgaAPI = await getKomgaAPI(stateManager)
    const authorization = await getAuthorizationString(stateManager)

    // We check credentials are set in server settings
    if (komgaAPI === null || authorization === null) {
        return "Impossible: Unset credentials in server settings";
    }

    // To test these information, we try to make a connection to the server
    // We could use a better endpoint to test the connection
    const request = createRequestObject({
        url: `${komgaAPI}/libraries/`,
        method: "GET",
        incognito: true, // We don't want the authorization to be cached
        headers: { authorization: authorization },
    });

    let responseStatus = undefined;

    try {
        const response = await requestManager.schedule(request, 1);
        responseStatus = response.status;
    } catch (error: any) {
        // If the server is unavailable error.message will be 'AsyncOperationTimedOutError'
        return `Failed: Could not connect to server - ${error.message}`;
    }

    switch (responseStatus) {
        case 200: {
            return "Successful connection!";
        }
        case 401: {
            return "Error 401 Unauthorized: Invalid credentials";
        }
        default: {
            return `Error ${responseStatus}`;
        }
    }
};

/* UI definition */

// NOTE: Submitted data won't be tested
export const serverSettingsMenu = (
    stateManager: SourceStateManager
): NavigationButton => {
    return createNavigationButton({
        id: "server_settings",
        value: "",
        label: "Server Settings",
        form: createForm({
            onSubmit: async (values: any) => setStateData(stateManager, values),
            validate: async () => true,
            sections: async () => [
                createSection({
                    id: "information",
                    header: undefined,
                    rows: async () => [
                        createMultilineLabel({
                            label: "Information",
                            value: "A demonstration server is available on:\nhttps://komga.org/guides/#demo\n\nMinimal Komga version: v0.100.0",
                            id: "description",
                        }),
                    ],
                }),
                createSection({
                    id: "serverSettings",
                    header: "Server Settings",
                    rows: async () => retrieveStateData(stateManager).then((values) => [
                        createInputField({
                            id: "serverAddress",
                            label: "Server URL",
                            placeholder: "http://127.0.0.1:8080",
                            value: values.serverURL,
                            maskInput: false,
                        }),
                        createInputField({
                            id: "serverUsername",
                            label: "Username",
                            placeholder: "AnimeLover420",
                            value: values.serverUsername,
                            maskInput: false,
                        }),
                        createInputField({
                            id: "serverPassword",
                            label: "Password",
                            placeholder: "Some Super Secret Password",
                            value: values.serverPassword,
                            maskInput: true,
                        }),
                    ]),
                }),
            ],
        }),
    });
};

export const testServerSettingsMenu = (
    stateManager: SourceStateManager,
    requestManager: RequestManager
): NavigationButton => {
    return createNavigationButton({
        id: "test_settings",
        value: "",
        label: "Try settings",
        form: createForm({
            onSubmit: async () => { },
            validate: async () => true,
            sections: async () => [
                createSection({
                    id: "information",
                    header: "Connection to Komga server:",
                    rows: () => testServerSettings(stateManager, requestManager).then(async (value) => [
                        createLabel({
                            label: value,
                            value: "",
                            id: "description",
                        }),
                    ]),
                }),
            ],
        }),
    });
};

export const resetSettingsButton = (
    stateManager: SourceStateManager
): Button => {
    return createButton({
        id: "reset",
        label: "Reset to Default",
        value: "",
        onTap: () => setStateData(stateManager, {}),
    });
};
