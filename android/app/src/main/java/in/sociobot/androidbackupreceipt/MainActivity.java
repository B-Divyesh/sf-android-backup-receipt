package in.sociobot.androidbackupreceipt;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(SafInventoryPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
