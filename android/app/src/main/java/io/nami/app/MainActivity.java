package io.nami.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DAppConnectorPlugin.class);
        super.onCreate(savedInstanceState);
    }

}
