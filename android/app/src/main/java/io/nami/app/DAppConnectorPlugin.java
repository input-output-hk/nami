package io.nami.app;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

import org.json.JSONException;

import java.io.ByteArrayOutputStream;
import java.util.Iterator;

@CapacitorPlugin(name = "DAppConnector")
public class DAppConnectorPlugin extends Plugin {

    @Override
    public void load() {
        Activity activity = getActivity();
        Intent intent = activity.getIntent();
        String action = intent.getAction();
        String pkg = activity.getCallingPackage();
        if (pkg == null) return;
        pkg = pkg.toLowerCase();
        Bundle data = intent.getBundleExtra("data");

        switch (action) {
            case BuildConfig.CARDANO_WALLET_INTENT_ACTION_ENABLE:
                emitEvent("enable", pkg);
                break;
            case BuildConfig.CARDANO_WALLET_INTENT_ACTION_IS_ENABLED:
                emitEvent("isEnabled", pkg);
                break;
            case BuildConfig.CARDANO_WALLET_INTENT_ACTION_GET_NETWORK_ID:
                emitEvent("getNetworkId", pkg);
                break;
            case BuildConfig.CARDANO_WALLET_INTENT_ACTION_GET_BALANCE:
                emitEvent("getBalance", pkg);
                break;
            case BuildConfig.CARDANO_WALLET_INTENT_ACTION_GET_UTXOS:
                emitEvent("getUtxos", pkg, data);
                break;
            case BuildConfig.CARDANO_WALLET_INTENT_ACTION_GET_COLLATERAL:
                emitEvent("getCollateral", pkg);
                break;
            case BuildConfig.CARDANO_WALLET_INTENT_ACTION_GET_USED_ADDRESSES:
                emitEvent("getUsedAddresses", pkg);
                break;
            case BuildConfig.CARDANO_WALLET_INTENT_ACTION_GET_UNUSED_ADDRESSES:
                emitEvent("getUnusedAddresses", pkg);
                break;
            case BuildConfig.CARDANO_WALLET_INTENT_ACTION_GET_CHANGE_ADDRESS:
                emitEvent("getChangeAddress", pkg);
                break;
            case BuildConfig.CARDANO_WALLET_INTENT_ACTION_GET_REWARD_ADDRESSES:
                emitEvent("getRewardAddresses", pkg);
                break;
            case BuildConfig.CARDANO_WALLET_INTENT_ACTION_SIGN_DATA:
                data.putBoolean("CIP30", true);
                emitEvent("signData", pkg, data);
                break;
            case BuildConfig.CARDANO_WALLET_INTENT_ACTION_SIGN_TX:
                emitEvent("signTx", pkg, data);
                break;
            case BuildConfig.CARDANO_WALLET_INTENT_ACTION_SUBMIT_TX:
                emitEvent("submitTx", pkg, data);
                break;
        }
    }

    public void emitEvent(String method, String pkg, Bundle data) {
        JSObject req = new JSObject();
        req.put("method", method);
        req.put("origin", pkg);
        if (data != null) {
            JSObject obj = new JSObject();
            for (String key : data.keySet()) {
                obj.put(key, data.get(key));
            }
            req.put("data", obj);
        }
        notifyListeners("dApp", req, true);
    }

    public void emitEvent(String method, String pkg) {
        emitEvent(method, pkg, null);
    }

    @PluginMethod()
    public void resolve(PluginCall call) throws JSONException {
        Intent result = new Intent();
        if (call.getString("data") != null) {
            result.putExtra("data", call.getString("data"));
        }
        else if (call.getInt("data") != null) {
            result.putExtra("data", call.getInt("data"));
        }
        else if (call.getBoolean("data") != null) {
            result.putExtra("data", call.getBoolean("data"));
        }
        else if (call.getArray("data", null) != null) {
            JSArray array = call.getArray("data");
            String[] data = (array.length() > 0) ? array.join(",").replace("\"", "").split(",") : new String[0];
            result.putExtra("data", data);
        }
        else if (call.getObject("data", null) != null) {
            JSObject obj = call.getObject("data");
            Bundle data = new Bundle();
            for (Iterator<String> it = obj.keys(); it.hasNext(); ) {
                String key = it.next();
                data.putString(key, obj.getString(key));
            }
            result.putExtra("data", data);
        }
        Activity activity = getActivity();
        activity.setResult(Activity.RESULT_OK, result);
        activity.finish();
    }

    @PluginMethod()
    public void reject(PluginCall call) {
        String error = call.getString("info");
        Integer code = call.getInt("code");
        Intent result = new Intent();
        result.putExtra("info", error);
        result.putExtra("code", code);
        Activity activity = getActivity();
        activity.setResult(Activity.RESULT_CANCELED, result);
        activity.finish();
    }

    @PluginMethod()
    public void getAppDetails(PluginCall call) {
        String pkg = call.getString("pkg");
        String name = pkg;
        String icon = "";
        try {
            PackageManager packageManager = getContext().getPackageManager();
            ApplicationInfo app = packageManager.getApplicationInfo(pkg, 0);

            name = (String) packageManager.getApplicationLabel(app);

            Drawable drawable = packageManager.getApplicationIcon(app);
            Bitmap bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
            drawable.draw(canvas);
            String base64 = encodeToBase64(bitmap, Bitmap.CompressFormat.JPEG, 50);
            icon = "data:image/jpeg;base64," + base64;
        }
        catch (Exception e) {
            e.printStackTrace();
        }

        JSObject ret = new JSObject();
        ret.put("pkg", pkg);
        ret.put("name", name);
        ret.put("icon", icon);
        call.resolve(ret);
    }

    public static String encodeToBase64(Bitmap image, Bitmap.CompressFormat compressFormat, int quality) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        image.compress(compressFormat, quality, baos);
        return Base64.encodeToString(baos.toByteArray(), Base64.DEFAULT);
    }

}
